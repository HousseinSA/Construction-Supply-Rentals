const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const DEMO_TAG = 'DEMO_EQUIPMENT';


const brands = ['Caterpillar', 'Komatsu', 'Volvo', 'JCB', 'Hitachi', 'Liebherr'];
const conditions = ['Excellent', 'Good', 'Fair'];

const equipmentTemplates = [
  { name: 'Pelle hydraulique', type: 'pelle-hydraulique', pricing: { dailyRate: 15000, hourlyRate: 2000 } },
  { name: 'Bulldozer', type: 'bulldozer', pricing: { dailyRate: 18000, hourlyRate: 2500 } },
  { name: 'Chargeuse sur pneus', type: 'chargeuse-sur-pneus', pricing: { dailyRate: 12000, hourlyRate: 1800 } },
  { name: 'Niveleuse', type: 'niveleuse-grader', pricing: { dailyRate: 14000, hourlyRate: 2200 } },
  { name: 'Compacteur tandem', type: 'compacteur-tandem', pricing: { dailyRate: 10000, hourlyRate: 1500 } },
  { name: 'Grue mobile', type: 'grue-mobile', pricing: { dailyRate: 25000, hourlyRate: 3500 } },
  { name: 'Chariot élévateur', type: 'chariot-elevateur-forklift', pricing: { dailyRate: 8000, hourlyRate: 1200 } },
  { name: 'Camion benne', type: 'camion-benne', pricing: { dailyRate: 16000, tonRate: 500 } },
  { name: 'Mini-pelle', type: 'mini-pelle', pricing: { dailyRate: 9000, hourlyRate: 1300 } },
  { name: 'Tractopelle', type: 'tractopelle', pricing: { dailyRate: 11000, hourlyRate: 1600 } },
];

async function generateDemoEquipment() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('construction_rental');
    
    // Get admin user - try email first, then userType
    let admin = await db.collection('users').findOne({ email: 'husseinabba@gmail.com' });
    if (!admin) {
      admin = await db.collection('users').findOne({ userType: 'admin' });
    }
    if (!admin) {
      console.error('❌ Admin user not found');
      return;
    }
    console.log(`✅ Found admin: ${admin.email || admin.phone}`);

    // Get equipment types
    const equipmentTypes = await db.collection('equipmentTypes').find({}).toArray();

    const demoEquipment = [];
    
    for (let i = 0; i < 20; i++) {
      const template = equipmentTemplates[i % equipmentTemplates.length];
      const equipmentType = equipmentTypes.find(et => et.slug === template.type);
      
      if (!equipmentType) {
        console.warn(`⚠️  Equipment type not found: ${template.type}`);
        continue;
      }

      const equipment = {
        referenceNumber: `${DEMO_TAG}-${String(i + 1).padStart(3, '0')}`,
        supplierId: admin._id,
        name: `${template.name} ${brands[i % brands.length]} #${i + 1}`,
        description: `${DEMO_TAG} - High-quality ${template.name.toLowerCase()} for construction projects. Well-maintained and ready for immediate use.`,
        categoryId: equipmentType.categoryId,
        equipmentTypeId: equipmentType._id,
        pricing: {
          type: template.pricing.tonRate ? 'per_ton' : 'both',
          ...template.pricing,
        },
        location: 'Nouakchott',
        images: [],
        specifications: {
          condition: conditions[i % conditions.length],
          brand: brands[i % brands.length],
          model: `Model-${2020 + (i % 5)}`,
          year: 2020 + (i % 5),
          hoursUsed: 500 + (i * 100),
        },
        usageCategory: template.pricing.tonRate ? 'tonnage' : 'hours',
        status: 'approved',
        isAvailable: true,
        isSold: false,
        listingType: 'forRent',
        createdBy: 'admin',
        createdById: admin._id,
        approvedBy: admin._id,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      demoEquipment.push(equipment);
    }

    if (demoEquipment.length === 0) {
      console.error('❌ No equipment could be generated. Check equipment types.');
      return;
    }

    const result = await db.collection('equipment').insertMany(demoEquipment);
    console.log(`✅ Successfully generated ${result.insertedCount} demo equipment items`);
    console.log(`📝 Reference numbers: ${DEMO_TAG}-001 to ${DEMO_TAG}-020`);
    console.log(`🗑️  To delete, run: node scripts/delete-demo-equipment.js`);
    
  } catch (error) {
    console.error('❌ Error generating demo equipment:', error);
  } finally {
    await client.close();
  }
}

generateDemoEquipment();
