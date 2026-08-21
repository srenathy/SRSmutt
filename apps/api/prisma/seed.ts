import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with updated Temple Info...');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'System Administrator',
      passwordHash,
      role: 'ADMIN'
    }
  });

  // 2. Create Sample Devotee User Account
  const devoteePasswordHash = await bcrypt.hash('devotee123', 10);
  const devoteeRecord = await prisma.devotee.create({
    data: {
      name: 'Srinivas Rao (Devotee)',
      phone: '9888877777',
      email: 'devotee@example.com',
      gotra: 'Kashyapa',
      nakshatra: 'Uttara Bhadrapada',
      rashi: 'Meena',
      city: 'Bengaluru'
    }
  });

  await prisma.user.upsert({
    where: { username: 'devotee' },
    update: {},
    create: {
      username: 'devotee',
      fullName: devoteeRecord.name,
      passwordHash: devoteePasswordHash,
      role: 'DEVOTEE',
      devoteeId: devoteeRecord.id
    }
  });

  // 3. Create or Update Temple Master Record with exact user details
  const templeData = {
    name: 'Mulabagala Sri Sripadaraja Matha (Rajajinagar Branch)',
    deity: 'Shri Raghavendra Swamy Brindavana Sannidhana',
    address: '541, 63rd Cross Rd, 5th Block, Rajajinagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560010',
    phone: '+91 89046 74124 / +91 98800 54620',
    email: 'contact@sripadarajamath.org',
    registrationNumber: 'MATHA/BLR/RAJ/001',
    upiId: 'sripadarajamath@upi',
    defaultPriest: 'Sri Ashwatha Narayan / Sri Ravikiran',
    receiptHeader: 'Om Sri Raghavendraya Namaha | Mulabagala Sri Sripadaraja Matha',
    receiptFooter: 'Shri Raghavendra Swamy Brindavana Sannidhana, Rajajinagar, Bengaluru.',
    expenseApprovalThreshold: 2000.00,
    monthlyExpenseBudget: 10000.00
  };

  const existingTemple = await prisma.temple.findFirst();
  if (existingTemple) {
    await prisma.temple.update({
      where: { id: existingTemple.id },
      data: templeData
    });
  } else {
    await prisma.temple.create({
      data: templeData
    });
  }

  // 4. Create Sample Sevas
  const sampleSevas = [
    { name: 'Sankalpa Archana', code: 'ARCH01', amount: 50.00, description: 'Personalized prayer with gotra & nakshatra chant' },
    { name: 'Panchamrutha Abhisheka', code: 'ABHI01', amount: 250.00, description: 'Sacred ritual bathing with milk, curd, honey, ghee, sugar' },
    { name: 'Mahamangalarathi', code: 'ARTI01', amount: 100.00, description: 'Grand auspicious lamp offering ritual' },
    { name: 'Sahasranama Archana', code: 'ARCH02', amount: 150.00, description: 'Chanting of 1000 holy names of the deity' },
    { name: 'Kanakabhisheka', code: 'ABHI02', amount: 1000.00, description: 'Special golden coin floral shower ritual' },
    { name: 'Annadana Seva', code: 'ANNA01', amount: 500.00, description: 'Sponsoring sacred meals for temple pilgrims' }
  ];

  for (const s of sampleSevas) {
    await prisma.seva.upsert({
      where: { code: s.code },
      update: s,
      create: s
    });
  }

  // 5. Create Sample Shashwata Sevas
  const sampleShashwataSevas = [
    { name: 'Shashwata Pooja (25 Years)', code: 'S_POOJA', amount: 2500.00, durationYears: 25, description: 'Annual pooja conducted every year on devotee specified tithi' },
    { name: 'Shashwata Annadana (Lifetime)', code: 'S_ANNA', amount: 5000.00, durationYears: 50, description: 'Annual feast sponsorship for pilgrims on specified day' },
    { name: 'Shashwata Nanda Deepa', code: 'S_DEEPA', amount: 3500.00, durationYears: 25, description: 'Perpetual sacred lamp lighting ritual sponsorship' }
  ];

  for (const ss of sampleShashwataSevas) {
    await prisma.shashwataSeva.upsert({
      where: { code: ss.code },
      update: ss,
      create: ss
    });
  }

  // 6. Seed Gotras Master
  const gotrasList = [
    'Kashyapa', 'Bharadwaja', 'Vashistha', 'Gautama', 'Atri',
    'Vishwamitra', 'Jamadagni', 'Harita', 'Kaundinya', 'Agastya',
    'Gargya', 'Naidhruva', 'Srivatsa', 'Angirasa', 'Vadhula'
  ];
  for (const g of gotrasList) {
    await prisma.gotra.upsert({
      where: { name: g },
      update: { name: g },
      create: { name: g }
    });
  }

  // 7. Seed 27 Nakshatras Master
  const nakshatrasList = [
    { name: 'Ashwini', rulingDeity: 'Ashwini Kumaras' },
    { name: 'Bharani', rulingDeity: 'Yama' },
    { name: 'Krittika', rulingDeity: 'Agni' },
    { name: 'Rohini', rulingDeity: 'Brahma' },
    { name: 'Mrigashira', rulingDeity: 'Soma' },
    { name: 'Ardra', rulingDeity: 'Rudra' },
    { name: 'Punarvasu', rulingDeity: 'Aditi' },
    { name: 'Pushya', rulingDeity: 'Brihaspati' },
    { name: 'Ashlesha', rulingDeity: 'Nagas' },
    { name: 'Magha', rulingDeity: 'Pitrs' },
    { name: 'Purva Phalguni', rulingDeity: 'Bhaga' },
    { name: 'Uttara Phalguni', rulingDeity: 'Aryaman' },
    { name: 'Hasta', rulingDeity: 'Savitar' },
    { name: 'Chitra', rulingDeity: 'Vishwakarma' },
    { name: 'Swati', rulingDeity: 'Vayu' },
    { name: 'Vishakha', rulingDeity: 'Indra-Agni' },
    { name: 'Anuradha', rulingDeity: 'Mitra' },
    { name: 'Jyeshtha', rulingDeity: 'Indra' },
    { name: 'Mula', rulingDeity: 'Nirriti' },
    { name: 'Purvashadha', rulingDeity: 'Apas' },
    { name: 'Uttarashadha', rulingDeity: 'Visvedevas' },
    { name: 'Shravana', rulingDeity: 'Vishnu' },
    { name: 'Dhanishta', rulingDeity: 'Vasus' },
    { name: 'Shatabhisha', rulingDeity: 'Varuna' },
    { name: 'Purva Bhadrapada', rulingDeity: 'Aja Ekapada' },
    { name: 'Uttara Bhadrapada', rulingDeity: 'Ahirbudhnya' },
    { name: 'Revati', rulingDeity: 'Pushan' }
  ];
  for (const n of nakshatrasList) {
    await prisma.nakshatra.upsert({
      where: { name: n.name },
      update: n,
      create: n
    });
  }

  // 8. Seed 12 Rashis Master
  const rashisList = [
    { name: 'Mesha', englishName: 'Aries' },
    { name: 'Vrishabha', englishName: 'Taurus' },
    { name: 'Mithuna', englishName: 'Gemini' },
    { name: 'Karka', englishName: 'Cancer' },
    { name: 'Simha', englishName: 'Leo' },
    { name: 'Kanya', englishName: 'Virgo' },
    { name: 'Tula', englishName: 'Libra' },
    { name: 'Vrishchika', englishName: 'Scorpio' },
    { name: 'Dhanu', englishName: 'Sagittarius' },
    { name: 'Makara', englishName: 'Capricorn' },
    { name: 'Kumbha', englishName: 'Aquarius' },
    { name: 'Meena', englishName: 'Pisces' }
  ];
  for (const r of rashisList) {
    await prisma.rashi.upsert({
      where: { name: r.name },
      update: r,
      create: r
    });
  }

  // 9. Seed Department Budgets for current month
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const defaultDepartments = [
    { departmentName: 'Cooking', monthlyCapAmount: 40000.00 },
    { departmentName: 'Flowers', monthlyCapAmount: 16000.00 },
    { departmentName: 'Leaves & Garland', monthlyCapAmount: 10000.00 },
    { departmentName: 'Temple Maintenance', monthlyCapAmount: 25000.00 },
    { departmentName: 'Festival & Special Events', monthlyCapAmount: 30000.00 },
    { departmentName: 'Utilities & Office', monthlyCapAmount: 15000.00 },
    { departmentName: 'Staff Allowance & Honorarium', monthlyCapAmount: 35000.00 },
    { departmentName: 'Miscellaneous', monthlyCapAmount: 10000.00 }
  ];

  for (const dep of defaultDepartments) {
    await prisma.departmentBudget.upsert({
      where: {
        departmentName_effectiveMonth: {
          departmentName: dep.departmentName,
          effectiveMonth: currentMonthKey
        }
      },
      update: { monthlyCapAmount: dep.monthlyCapAmount },
      create: {
        departmentName: dep.departmentName,
        monthlyCapAmount: dep.monthlyCapAmount,
        effectiveMonth: currentMonthKey
      }
    });
  }

  // 10. One-time Data Migration: Map existing expense categories to departmentName
  const allExpenses = await prisma.expense.findMany();
  for (const exp of allExpenses) {
    let depName = 'Miscellaneous';
    const catLower = (exp.category || '').toLowerCase();
    if (catLower.includes('cook') || catLower.includes('kitchen') || catLower.includes('food')) {
      depName = 'Cooking';
    } else if (catLower.includes('flower') || catLower.includes('puja material')) {
      depName = 'Flowers';
    } else if (catLower.includes('garland') || catLower.includes('leaf') || catLower.includes('leaves')) {
      depName = 'Leaves & Garland';
    } else if (catLower.includes('clean') || catLower.includes('maint')) {
      depName = 'Temple Maintenance';
    } else if (catLower.includes('festival') || catLower.includes('event')) {
      depName = 'Festival & Special Events';
    } else if (catLower.includes('electric') || catLower.includes('water') || catLower.includes('util')) {
      depName = 'Utilities & Office';
    } else if (catLower.includes('staff') || catLower.includes('salary') || catLower.includes('allowance') || catLower.includes('petty')) {
      depName = 'Staff Allowance & Honorarium';
    }

    await prisma.expense.update({
      where: { id: exp.id },
      data: { departmentName: depName }
    });
  }

  // 11. Seed Initial Photo Gallery Images
  const initialGallery = [
    {
      title: 'Sri Raghavendra Swamy — Alankara Darshana',
      caption: 'Daily morning consecrated Alankara at Rajajinagar Sannidhana',
      imageUrl: '/gallery/brindavana-1.jpg',
      category: 'ALANKARA',
      order: 1,
      active: true
    },
    {
      title: 'Sri Raghavendra Swamy — Pushpa Alankara',
      caption: 'Sacred floral decoration during special festival celebrations',
      imageUrl: '/gallery/brindavana-2.jpg',
      category: 'ALANKARA',
      order: 2,
      active: true
    },
    {
      title: 'Sri Raghavendra Swamy — Vastra Alankara',
      caption: 'Traditional silk vastra offering and golden sanctum view',
      imageUrl: '/gallery/brindavana-3.jpg',
      category: 'ALANKARA',
      order: 3,
      active: true
    },
    {
      title: 'Sri Raghavendra Matha — Rajajinagar Sannidhana',
      caption: 'Consecrated Mrittika Brindavana sanctum sanctorum',
      imageUrl: '/gallery/brindavana-4.jpg',
      category: 'TEMPLE',
      order: 4,
      active: true
    }
  ];

  for (const img of initialGallery) {
    const exists = await prisma.galleryImage.findFirst({ where: { title: img.title } });
    if (!exists) {
      await prisma.galleryImage.create({ data: img });
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
