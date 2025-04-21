import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDtos, VerifyEmailDTO, ChangePasswordDTO } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { GenerateOTP } from "utils/generateOTP";
import * as nodemailer from "nodemailer";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    async login(dto: AuthDtos) {
        if (!dto.email || !dto.password) {
            throw new UnauthorizedException("Email and password are required");
        }

        const user = await this.prisma.user.findUnique({ where: { email: dto.email.replace(/['"]/g, '') } });
        if (!user) throw new UnauthorizedException("No user found");

        if (!user.isVerified) {
            throw new UnauthorizedException("Email is not verified. Please verify using OTP.");
        }

        const isPasswordValid = await argon.verify(user.password, dto.password);
        if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

        return this.signToken({ userId: user.id, email: user.email });
    }

    async signup(dto: AuthDtos) {
        if (!dto.email || !dto.password || !dto.firstName) {
            throw new HttpException("Email, password, and first name are required", 400);
        }

        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) throw new HttpException("User already exists", 400);

        const hashedPassword = await argon.hash(dto.password);
        const otp = GenerateOTP();

        await this.SendMail(dto.email, otp);

        await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                otp: otp,
                isVerified: false,
                role: dto.role,
                isProfileComplete: true ? dto.role === "ADMIN" : false,
            },
        });

        return { message: "OTP sent to email for verification" };

    }

    async verifyOTP(email: string, otp: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new HttpException("User not found", 404);

        if (user.isVerified) throw new HttpException("User already verified", 400);
        if (user.otp !== otp) throw new HttpException("Incorrect OTP", 401);

        await this.prisma.user.update({
            where: { email },
            data: { isVerified: true, otp: "" }
        });

        return this.signToken({ userId: user.id, email: user.email });
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new HttpException("User not found", 404);
        if (!user.isVerified) throw new HttpException("User is not verified", 401);

        const otp = GenerateOTP();
        await this.prisma.user.update({
            where: { email },
            data: { forgotPassword: true, otp: otp }
        });

        await this.SendMail(email, otp);

        return { message: "Forgot password OTP sent successfully" };
    }

    async changeNewPassword(dto: ChangePasswordDTO) {
        const { email, password, otp } = dto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new HttpException("User not found", 404);
        if (!user.isVerified || !user.forgotPassword) throw new HttpException("Invalid request", 400);
        if (user.otp !== otp) throw new HttpException("Invalid OTP", 401);

        const hashedPassword = await argon.hash(password);
        await this.prisma.user.update({
            where: { email },
            data: { password: hashedPassword, forgotPassword: false, otp: "" }
        });

        return { message: "Password changed successfully" };
    }

    async signToken({ userId, email }: { userId: string; email: string }): Promise<{ access_token: string }> {
        const jwtSecret = this.config.get<string>("JWT_SECRET");
        if (!jwtSecret) throw new Error("JWT_SECRET is not set in environment variables");

        const payload = { sub: userId, email };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: "7d",
            secret: jwtSecret,
        });

        return { access_token: token };
    }

    async SendMail(email: string, otp: string) {
        const SENDER_EMAIL = this.config.get("SENDER_EMAIL")
        const SENDER_PASSWORD = this.config.get("SENDER_PASSWORD")
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_PASSWORD
            }
        });

        const mailOptions = {
            from: SENDER_EMAIL,
            to: email,
            subject: "Your OTP for Alumni Nomination Verification",
            html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification - Alumni Nomination</title>
    <style>
      body {
        background-color: #f2f4f8;
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        padding: 40px;
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .header h1 {
        font-size: 24px;
        color: #1a237e;
        margin: 0;
      }
      .content {
        font-size: 16px;
      }
      .otp-box {
        background-color: #e8f0fe;
        padding: 20px;
        margin: 30px 0;
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        color: #0d47a1;
        border-radius: 6px;
        letter-spacing: 2px;
      }
      .footer {
        font-size: 14px;
        color: #777;
        text-align: center;
        margin-top: 40px;
        border-top: 1px solid #e0e0e0;
        padding-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Alumni Nomination Portal</h1>
      </div>
      <div class="content">
        <p>Dear Candidate,</p>

        <p>Thank you for participating in the Alumni Nomination process. To ensure the security of your account, please verify your email address using the One-Time Password (OTP) provided below:</p>

        <div class="otp-box">${otp}</div>

        <p>This OTP is valid for the next <strong>10 minutes</strong>. If you did not initiate this request, please disregard this email.</p>

        <p>We appreciate your commitment to recognizing outstanding alumni.</p>

        <p>Best regards,<br>
        <strong>Alumni Nomination Committee</strong></p>
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} Alumni Nomination Committee. All rights reserved.
      </div>
    </div>
  </body>
</html>
`,
        };

        try {
            await transporter.sendMail(mailOptions);
            return { success: true, message: `Mail Sent to ${email}` };
        } catch (error) {
            throw new HttpException(`Error sending email: ${error.message}`, 500);
        }
    }
}
