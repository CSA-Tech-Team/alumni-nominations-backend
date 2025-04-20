import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const criteriaTexts = [
  `Innovations in the application of technology, design & development, achievements, awards & recognition (external & internal), technical leadership activities & positions, fellowships in professional organizations, patents & publications, industry standards activities, collaborations with academia, community service.`,
  `Exceptional management skills, a leadership position with company, awards & recognition, Board memberships, Fellowships, testimonials, global stature, collaborations with academia, community service, team leadership in setting up new enterprises, mentoring track record.`,
  `Significant entrepreneurial skills & accomplishments, a creation of support structure for entrepreneurs, the success of start-ups in establishing market presence, the scale.`,
  `Significant accomplishments in various areas—service to society, service to the institute, service to alumni, excellence in public administration, notable achievements in media & fine arts, leadership and innovation, the scale of impact.`,
  `Academic achievements and honours, intellectual contributions to the field of expertise, pioneering work, journal papers & citation indices, conference papers, books and book chapters, number of Ph.D scholars guided, visiting professorship, lectureships, fellowships in professional associations, student mentoring & welfare activities, peer testimonials, awards & recognition.`,
  `Preferred age category is 45 to 55 years of age.`,
];

async function main() {
  for (const text of criteriaTexts) {
    await prisma.criteria.create({
      data: { text },
    });
  }

  console.log('Criteria seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding criteria:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
