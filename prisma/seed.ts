import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unsplash photos per commodity keyword (free, no auth needed)
const PHOTOS: Record<string, string[]> = {
  'Padi (Gabah)': [
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&q=80',
  ],
  Beras: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'https://images.unsplash.com/photo-1614456719585-c257fb2b4e56?w=600&q=80',
  ],
  Jagung: [
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
    'https://images.unsplash.com/photo-1601593768797-7f4894329af2?w=600&q=80',
  ],
  Kedelai: [
    'https://images.unsplash.com/photo-1599940824399-b87987ce0790?w=600&q=80',
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80',
  ],
  'Ubi Kayu': [
    'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=600&q=80',
  ],
  'Ubi Jalar': [
    'https://images.unsplash.com/photo-1596097635121-14b63a7e0f7f?w=600&q=80',
    'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&q=80',
  ],
  Porang: [
    'https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=600&q=80',
  ],
  'Bawang Merah': [
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
    'https://images.unsplash.com/photo-1587049016823-69ef9d68f4af?w=600&q=80',
  ],
  'Bawang Putih': [
    'https://images.unsplash.com/photo-1615477550927-6ec8445f8ab0?w=600&q=80',
    'https://images.unsplash.com/photo-1540148426945-6cf2732e2376?w=600&q=80',
  ],
  'Cabai Merah': [
    'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    'https://images.unsplash.com/photo-1587411768515-eeac0647deed?w=600&q=80',
  ],
  'Cabai Rawit': [
    'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    'https://images.unsplash.com/photo-1587411768515-eeac0647deed?w=600&q=80',
  ],
  Kubis: [
    'https://images.unsplash.com/photo-1594282486756-7e4b5a11f720?w=600&q=80',
    'https://images.unsplash.com/photo-1508747703725-719f381ce012?w=600&q=80',
  ],
  Kentang: [
    'https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=600&q=80',
    'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
  ],
  Tomat: [
    'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=600&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
  ],
  Wortel: [
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
    'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&q=80',
  ],
  Buncis: [
    'https://images.unsplash.com/photo-1567375698348-5d9d5ae86b1a?w=600&q=80',
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&q=80',
  ],
  Kol: [
    'https://images.unsplash.com/photo-1594282486756-7e4b5a11f720?w=600&q=80',
  ],
  Kopi: [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
    'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80',
  ],
  'Buah Kakao': [
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80',
    'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80',
  ],
  Lada: [
    'https://images.unsplash.com/photo-1599940824399-b87987ce0790?w=600&q=80',
    'https://images.unsplash.com/photo-1506075701591-467745643a35?w=600&q=80',
  ],
  Cengkih: [
    'https://images.unsplash.com/photo-1599940824399-b87987ce0790?w=600&q=80',
  ],
  'Biji Pala': [
    'https://images.unsplash.com/photo-1599940824399-b87987ce0790?w=600&q=80',
  ],
  Vanili: [
    'https://images.unsplash.com/photo-1599940824399-b87987ce0790?w=600&q=80',
  ],
  Nanas: [
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=80',
    'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&q=80',
  ],
  Durian: [
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80',
    'https://images.unsplash.com/photo-1587305129240-a1830dc3d69f?w=600&q=80',
  ],
  Mangga: [
    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
    'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=600&q=80',
  ],
  Alpukat: [
    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80',
    'https://images.unsplash.com/photo-1572694634482-35a4e9fd8d5c?w=600&q=80',
  ],
  Pepaya: [
    'https://images.unsplash.com/photo-1526438220045-d6e9208f70c5?w=600&q=80',
    'https://images.unsplash.com/photo-1563122926-d10447af0e5d?w=600&q=80',
  ],
  'Ikan Nila': [
    'https://images.unsplash.com/photo-1534604973900-c43f985c2b19?w=600&q=80',
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
  ],
  'Ikan Mujair': [
    'https://images.unsplash.com/photo-1534604973900-c43f985c2b19?w=600&q=80',
  ],
  'Ikan Lele': [
    'https://images.unsplash.com/photo-1534604973900-c43f985c2b19?w=600&q=80',
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
  ],
  'Ikan Mas': [
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
  ],
  'Ikan Bandeng': [
    'https://images.unsplash.com/photo-1534604973900-c43f985c2b19?w=600&q=80',
  ],
  'Ikan Tuna': [
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
    'https://images.unsplash.com/photo-1599098645483-e1c4c6f9e39a?w=600&q=80',
  ],
  'Ikan Cakalang': [
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
  ],
  'Ikan Tongkol': [
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
    'https://images.unsplash.com/photo-1599098645483-e1c4c6f9e39a?w=600&q=80',
  ],
  'Ikan Kembung': [
    'https://images.unsplash.com/photo-1534604973900-c43f985c2b19?w=600&q=80',
  ],
  'Ikan Kakap Merah': [
    'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=600&q=80',
  ],
};

function pickPhoto(commodityName: string, index: number): string {
  const photos = PHOTOS[commodityName];
  if (!photos || photos.length === 0) {
    return `https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80`;
  }
  return photos[index % photos.length];
}

const LATITUDES = [
  { lat: -7.55, lng: 110.55, name: 'Jawa Tengah' },
  { lat: -6.56, lng: 107.62, name: 'Jawa Barat' },
  { lat: -7.97, lng: 110.63, name: 'Yogyakarta' },
  { lat: -7.76, lng: 110.47, name: 'Sleman' },
  { lat: -6.1, lng: 106.58, name: 'Tangerang' },
  { lat: -8.34, lng: 115.09, name: 'Bali' },
  { lat: -7.25, lng: 112.75, name: 'Surabaya' },
  { lat: -6.97, lng: 110.41, name: 'Semarang' },
  { lat: -5.14, lng: 119.43, name: 'Makassar' },
  { lat: -8.67, lng: 115.21, name: 'Denpasar' },
];

interface ProductSeed {
  farmerIndex: number;
  commodityName: string;
  title: string;
  description: string;
  price: number;
  unit: 'kg' | 'ikat' | 'ekor';
  grade: 'A' | 'B' | 'C';
  quantity: number;
  latOffset: number;
  lngOffset: number;
  isPreorder?: boolean;
}

const PRODUCTS: ProductSeed[] = [
  // === TANAMAN PANGAN & HORTIKULTURA (50 produk) ===
  // Budi - Jawa Tengah
  {
    farmerIndex: 0,
    commodityName: 'Padi (Gabah)',
    title: 'Padi IR64 Gabah Kering Panen',
    description:
      'Padi varietas IR64, panen bulan Agustus 2026. Kadar air rendah, siap giling. Kualitas premium untuk beras konsumsi.',
    price: 5800,
    unit: 'kg',
    grade: 'A',
    quantity: 5000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 0,
    commodityName: 'Padi (Gabah)',
    title: 'Padi Ciherang Gabah Basah',
    description:
      'Padi Ciherang panen baru, kadar air masih tinggi. Cocok untuk penggilingan lokal. Harga nego untuk partai besar.',
    price: 5200,
    unit: 'kg',
    grade: 'B',
    quantity: 3000,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Beras',
    title: 'Beras Premium Setra Pulen 10kg',
    description:
      'Beras premium dari padi IR64, pulen dan wangi. Kemasan karung 10kg. Cocok untuk restoran dan hotel.',
    price: 14500,
    unit: 'kg',
    grade: 'A',
    quantity: 2000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 0,
    commodityName: 'Beras',
    title: 'Beras Medium Raja 5kg',
    description:
      'Beras medium kualitas baik untuk konsumsi rumah tangga. Bersih dan tidak berbau.',
    price: 11000,
    unit: 'kg',
    grade: 'B',
    quantity: 3000,
    latOffset: 0.005,
    lngOffset: -0.005,
  },
  {
    farmerIndex: 0,
    commodityName: 'Cabai Merah',
    title: 'Cabai Merah Keriting Segar',
    description:
      'Cabai merah keriting kualitas A, pedas dan segar. Panen hari ini langsung dari kebun. Stok 800kg.',
    price: 32000,
    unit: 'kg',
    grade: 'A',
    quantity: 800,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 0,
    commodityName: 'Cabai Rawit',
    title: 'Cabai Rawit Setan Pedas',
    description:
      'Cabai rawit varietas setan, tingkat kepedasan sangat tinggi. Cocok untuk sambal dan industri makanan.',
    price: 42000,
    unit: 'kg',
    grade: 'A',
    quantity: 500,
    latOffset: 0.015,
    lngOffset: 0.01,
  },

  // Siti Aminah - Jawa Barat
  {
    farmerIndex: 1,
    commodityName: 'Bawang Merah',
    title: 'Bawang Merah Brebes Super',
    description:
      'Bawang merah kualitas super dari Brebes. Kering, berisi penuh, dan tahan lama. Sudah di sortir ukuran besar.',
    price: 38000,
    unit: 'kg',
    grade: 'A',
    quantity: 1500,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Bawang Merah',
    title: 'Bawang Merah Brebes Grade B',
    description:
      'Bawang merah grade B, ukuran sedang. Cocok untuk pedagang pasar dan warung. Harga bersahabat.',
    price: 30000,
    unit: 'kg',
    grade: 'B',
    quantity: 2000,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 1,
    commodityName: 'Bawang Putih',
    title: 'Bawang Putih Import Chongming',
    description:
      'Bawang putih import grade A, ukuran besar. Cocok untuk restoran dan industri makanan.',
    price: 28000,
    unit: 'kg',
    grade: 'A',
    quantity: 1200,
    latOffset: 0.005,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 1,
    commodityName: 'Tomat',
    title: 'Tomat Segar Grade A Merah',
    description:
      'Tomat merah segar kualitas A, ukuran besar dan berat. Cocok untuk saus, jus, dan lalapan.',
    price: 8500,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Tomat',
    title: 'Tomat Hijau untuk Acar',
    description:
      'Tomat hijau segar khusus untuk olahan acar dan sayur asem. Tekstur keras dan tidak mudah lembek.',
    price: 6000,
    unit: 'kg',
    grade: 'B',
    quantity: 800,
    latOffset: 0.01,
    lngOffset: 0.005,
  },
  {
    farmerIndex: 1,
    commodityName: 'Cabai Rawit',
    title: 'Cabai Rawit Hijau Segar',
    description:
      'Cabai rawit hijau segar dari kebun Subang. Cocok untuk sambal ijo dan masakan rumahan.',
    price: 25000,
    unit: 'kg',
    grade: 'A',
    quantity: 600,
    latOffset: -0.01,
    lngOffset: 0.01,
  },

  // Agus - Yogyakarta
  {
    farmerIndex: 2,
    commodityName: 'Jagung',
    title: 'Jagung Manis Hibrida Super',
    description:
      'Jagung manis varietas hibrida, rasa manis alami dan tekstur renyah. Cocok untuk olahan pabrik dan konsumsi langsung.',
    price: 7200,
    unit: 'kg',
    grade: 'A',
    quantity: 3000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 2,
    commodityName: 'Jagung',
    title: 'Jagung Pipilan Kering',
    description:
      'Jagung pipilan kering untuk pakan ternak dan bahan baku tepung jagung. Kadar air di bawah 14%.',
    price: 5500,
    unit: 'kg',
    grade: 'B',
    quantity: 5000,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 2,
    commodityName: 'Kentang',
    title: 'Kentang Dieng Grade A',
    description:
      'Kentang segar dari dataran tinggi Dieng, Wonosobo. Ukuran besar 200-350gr/butir. Kualitas ekspor.',
    price: 12000,
    unit: 'kg',
    grade: 'A',
    quantity: 2500,
    latOffset: -0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 2,
    commodityName: 'Kentang',
    title: 'Kentang Dieng Grade B',
    description:
      'Kentang Dieng grade B, ukuran sedang 100-200gr/butir. Cocok untuk kentang goreng dan panggang.',
    price: 9000,
    unit: 'kg',
    grade: 'B',
    quantity: 3000,
    latOffset: -0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 2,
    commodityName: 'Padi (Gabah)',
    title: 'Padi Inpari 32 Gabah',
    description:
      'Padi Inpari 32 tahan hama, hasil tinggi. Gabah kering siap giling dengan kualitas bagus.',
    price: 5500,
    unit: 'kg',
    grade: 'A',
    quantity: 4000,
    latOffset: 0.005,
    lngOffset: 0.005,
  },

  // Rina - Sleman
  {
    farmerIndex: 3,
    commodityName: 'Kubis',
    title: 'Kubis Bulat Segar Dataran Tinggi',
    description:
      'Kubis bulat segar dari dataran tinggi Sleman. Daun padat dan renyah. Cocok untuk sayur, salad, dan olahan.',
    price: 5000,
    unit: 'kg',
    grade: 'A',
    quantity: 2000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 3,
    commodityName: 'Wortel',
    title: 'Wortel Uniform Super',
    description:
      'Wortel ukuran seragam dari kebun dataran tinggi. Warna oranye pekat, manis dan renyah. Cocok untuk jus dan olahan.',
    price: 8000,
    unit: 'kg',
    grade: 'A',
    quantity: 1500,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 3,
    commodityName: 'Buncis',
    title: 'Buncis Hijau Segar Pilihan',
    description:
      'Buncis hijau segar pilihan, ukuran seragam. Cocok untuk tumis, salad, dan olahan restoran.',
    price: 12000,
    unit: 'kg',
    grade: 'A',
    quantity: 800,
    latOffset: -0.005,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 3,
    commodityName: 'Kol',
    title: 'Kol Putih Segar Premium',
    description:
      'Kol putih segar kualitas premium, daun padat dan putih bersih. Cocok untuk chattime dan masakan Asia.',
    price: 6500,
    unit: 'kg',
    grade: 'A',
    quantity: 1800,
    latOffset: 0.005,
    lngOffset: -0.005,
  },
  {
    farmerIndex: 3,
    commodityName: 'Tomat',
    title: 'Tomat Cherry Segar',
    description:
      'Tomat cherry segar dari greenhouse Sleman. Rasa manis alami, ukuran kecil seragam. Cocok untuk salad dan garnish.',
    price: 18000,
    unit: 'kg',
    grade: 'A',
    quantity: 400,
    latOffset: 0,
    lngOffset: 0.01,
  },

  // Dodi - Tangerang (nelayan tapi juga tanaman)
  {
    farmerIndex: 4,
    commodityName: 'Ubi Jalar',
    title: 'Ubi Jalar Cilembu Manis',
    description:
      'Ubi jalar Cilembu asli, rasa manis legit saat dipanggang. Kualitas premium untuk restoran dan ekspor.',
    price: 15000,
    unit: 'kg',
    grade: 'A',
    quantity: 1200,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ubi Kayu',
    title: 'Ubi Kayu Segar Kualitas Tapioka',
    description:
      'Ubi kayu segar untuk bahan baku tepung tapioka dan olahan. Kadar pati tinggi, umbi besar.',
    price: 3500,
    unit: 'kg',
    grade: 'A',
    quantity: 8000,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Kedelai',
    title: 'Kedelai Hitam Organik',
    description:
      'Kedelai hitam organik untuk bahan kecap, tempe, dan tahu. Tanpa pestisida, sertifikat organik tersedia.',
    price: 12000,
    unit: 'kg',
    grade: 'A',
    quantity: 2000,
    latOffset: -0.01,
    lngOffset: 0,
  },

  // === KOMODITAS PERKEBUNAN (25 produk) ===
  // Rina - Sleman (perkebunan)
  {
    farmerIndex: 3,
    commodityName: 'Kopi',
    title: 'Kopi Arabika Gayo Specialty',
    description:
      'Kopi arabika specialty dari dataran tinggi Gayo, Aceh. Proses semi-washed, roast profile medium. SCA score 82+',
    price: 95000,
    unit: 'kg',
    grade: 'A',
    quantity: 500,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 3,
    commodityName: 'Kopi',
    title: 'Kopi Robusta Temanggung',
    description:
      'Kopi robusta Temanggung kualitas ekspor. Rasa kuat, body tebal, cocok untuk espresso dan campuran.',
    price: 55000,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 3,
    commodityName: 'Durian',
    title: 'Durian Montong Premium',
    description:
      'Durian Montong premium dari kebun sendiri. Daging tebal, manis legit, aroma kuat. Siap kirim dalam 2 hari.',
    price: 75000,
    unit: 'kg',
    grade: 'A',
    quantity: 200,
    latOffset: 0.005,
    lngOffset: 0.01,
    isPreorder: true,
  },
  {
    farmerIndex: 3,
    commodityName: 'Mangga',
    title: 'Mangga Harum Manis Matang Pohon',
    description:
      'Mangga Harum Manis matang pohon dari kebun Sleman. Rasa manis dan aroma harum. Panen bulanan.',
    price: 22000,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 3,
    commodityName: 'Mangga',
    title: 'Mangga Kiojay Jumbo',
    description:
      'Mangga Kiojay ukuran jumbo 1-2 kg/buah. Daging tebal, manis, dan minim serat. Cocok untuk ekspor.',
    price: 28000,
    unit: 'kg',
    grade: 'A',
    quantity: 500,
    latOffset: -0.01,
    lngOffset: 0.01,
  },

  // Siti Aminah - Jawa Barat (perkebunan)
  {
    farmerIndex: 1,
    commodityName: 'Nanas',
    title: 'Nanas Madu Subang Manis',
    description:
      'Nanas madu varietas MD2 dari Subang. Rasa manis tinggi, minimal asam. Siap petik dan kirim.',
    price: 8000,
    unit: 'kg',
    grade: 'A',
    quantity: 2000,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Pepaya',
    title: 'Pepaya California Import',
    description:
      'Pepaya varietas California, ukuran sedang 1-1.5kg. Daging oranye tebal, manis, dan berair.',
    price: 7000,
    unit: 'kg',
    grade: 'A',
    quantity: 1500,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Alpukat',
    title: 'Alpukat Mentega Super',
    description:
      'Alpukat varietas mentega dari Jawa Barat. Daging tebal, lembut seperti mentega, rasa gurih. Ukuran besar.',
    price: 35000,
    unit: 'kg',
    grade: 'A',
    quantity: 800,
    latOffset: -0.01,
    lngOffset: 0.01,
  },

  // Budi - Jawa Tengah (perkebunan)
  {
    farmerIndex: 0,
    commodityName: 'Buah Kakao',
    title: 'Kakao Fermentasi Kualitas Export',
    description:
      'Biji kakao fermentasi dari Jawa Tengah. Telah melalui proses fermentasi 6 hari. Cocok untuk chocolate maker.',
    price: 75000,
    unit: 'kg',
    grade: 'A',
    quantity: 600,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Lada',
    title: 'Lada Hitam Kualitas Ekspor',
    description:
      'Lada hitam kering dari Sulawesi. Ukuran butir besar, aroma kuat. Sertifikat SPS untuk ekspor.',
    price: 120000,
    unit: 'kg',
    grade: 'A',
    quantity: 300,
    latOffset: 0,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Cengkih',
    title: 'Cengkih Kering Grade A',
    description:
      'Cengkih kering kualitas premium, warna coklat gelap. Kadar minyak tinggi. Cocok untuk industri rokok dan farmasi.',
    price: 85000,
    unit: 'kg',
    grade: 'A',
    quantity: 400,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 0,
    commodityName: 'Biji Pala',
    title: 'Biji Pala Buka Utuh',
    description:
      'Biji pala utuh kering dari Maluku. Aroma harum dan kuat. Cocok untuk bumbu masakan dan ekstrak.',
    price: 95000,
    unit: 'kg',
    grade: 'A',
    quantity: 250,
    latOffset: -0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Vanili',
    title: 'Vanili Panjang Kering Grade A',
    description:
      'Vanili panjang kering dari Jawa Barat. Aroma vanillin alami tinggi. Cocok untuk pastry dan industri makanan.',
    price: 250000,
    unit: 'kg',
    grade: 'A',
    quantity: 100,
    latOffset: 0.005,
    lngOffset: -0.005,
  },

  // Agus - Yogyakarta (perkebunan)
  {
    farmerIndex: 2,
    commodityName: 'Nanas',
    title: 'Nanas Gowok Yogyakarta',
    description:
      'Nanas varietas lokal Gowok, rasa manis alami. Cocok untuk jus dan olahan manisan. Harga petani langsung.',
    price: 6000,
    unit: 'kg',
    grade: 'B',
    quantity: 3000,
    latOffset: 0,
    lngOffset: 0,
  },

  // Dodi - Tangerang (perkebunan)
  {
    farmerIndex: 4,
    commodityName: 'Mangga',
    title: 'Mangga Gedong Gincu Segar',
    description:
      'Mangga Gedong Gincu dari Majalaya. Aroma harum, rasa manis asam segar. Ukuran sedang.',
    price: 25000,
    unit: 'kg',
    grade: 'A',
    quantity: 700,
    latOffset: 0.01,
    lngOffset: 0,
  },

  // === KOMODITAS PERIKANAN (15 produk) ===
  // Dodi - Tangerang
  {
    farmerIndex: 4,
    commodityName: 'Ikan Nila',
    title: 'Ikan Nila Merah Segar Keramba',
    description:
      'Ikan nila merah segar dari keramba laut Teluknaga. Ukuran 500g-1kg/ekor. Dipanen pagi hari.',
    price: 35000,
    unit: 'kg',
    grade: 'A',
    quantity: 500,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Nila',
    title: 'Ikan Nila Hitam Konsumsi',
    description:
      'Ikan nila hitam segar untuk konsumsi. Ukuran 300-500g. Cocok untuk bakar, goreng, dan pesmol.',
    price: 28000,
    unit: 'kg',
    grade: 'B',
    quantity: 800,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Lele',
    title: 'Ikan Lele Segar Distributor',
    description:
      'Ikan lele segar ukuran konsumsi 300-400g/ekor. Cocok untuk pecel lele dan warung makan.',
    price: 22000,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: -0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Tuna',
    title: 'Ikan Tuna Segar Laut Lemuru',
    description:
      'Tuna segar hasil tangkapan armada Lemuru. Ukuran 3-5 kg/ekor. Cocok untuk sashimi dan kaleng.',
    price: 65000,
    unit: 'kg',
    grade: 'A',
    quantity: 300,
    latOffset: 0,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Tongkol',
    title: 'Ikan Tongkol Segar Frozen',
    description:
      'Ikan tongkol segar yang langsung difreezero setelah tangkap. Kualitas super, daging padat. Cocok untuk pindang.',
    price: 45000,
    unit: 'kg',
    grade: 'A',
    quantity: 600,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Bandeng',
    title: 'Ikan Bandeng Segar Keramba',
    description:
      'Ikan bandeng segar dari keramba muara. Ukuran jumbo 1-2kg. Cocok untuk bandeng bakar dan presto.',
    price: 40000,
    unit: 'kg',
    grade: 'A',
    quantity: 400,
    latOffset: -0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Cakalang',
    title: 'Ikan Cakalang Segar Tangkapan Nelayan',
    description:
      'Cakalang segar tangkapan nelayan tradisional. Ukuran besar, daging merah. Cocok untuk sarden dan abon.',
    price: 38000,
    unit: 'kg',
    grade: 'A',
    quantity: 500,
    latOffset: 0,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Kembung',
    title: 'Ikan Kembung Segar Muara Angke',
    description:
      'Ikan kembung segar dari Muara Angke. Ukuran sedang, daging berlemak. Cocok untuk pindang dan asam pedas.',
    price: 30000,
    unit: 'kg',
    grade: 'A',
    quantity: 700,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Kakap Merah',
    title: 'Ikan Kakap Merah Laut Segar',
    description:
      'Kakap merah laut segar tangkapan nelayan. Ukuran jumbo, daging putih tebal. Cocok untuk steam dan bakar.',
    price: 85000,
    unit: 'kg',
    grade: 'A',
    quantity: 200,
    latOffset: -0.005,
    lngOffset: 0.005,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Mas',
    title: 'Ikan Mas Segar Kolam',
    description:
      'Ikan mas segar dari kolam budidaya lokal. Ukuran sedang 500g-1kg. Cocok untuk goreng dan pesmol.',
    price: 35000,
    unit: 'kg',
    grade: 'B',
    quantity: 600,
    latOffset: 0.005,
    lngOffset: -0.005,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Mujair',
    title: 'Ikan Mujair Segar Danau',
    description:
      'Ikan mujair segar dari danau permintaan. Rasa daging manis dan gurih. Cocok untuk bakar dan goreng tepung.',
    price: 32000,
    unit: 'kg',
    grade: 'A',
    quantity: 400,
    latOffset: 0,
    lngOffset: 0.01,
  },

  // Extra products from different locations
  {
    farmerIndex: 0,
    commodityName: 'Beras',
    title: 'Beras Organik Sertifikasi',
    description:
      'Beras organik bersertifikat SNI. Tanpa pupuk kimia dan pestisida. Cocok untuk konsumen sehat.',
    price: 22000,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: 0.02,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Cabai Merah',
    title: 'Cabai Merah Besar Utuh',
    description:
      'Cabai merah besar utuh segar dari Jawa Barat. Ukuran besar, warna merah mengkilap. Cocok untuk olahan sambal.',
    price: 30000,
    unit: 'kg',
    grade: 'A',
    quantity: 900,
    latOffset: 0,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 2,
    commodityName: 'Wortel',
    title: 'Wortel Impor Australia Grade B',
    description:
      'Wortel import grade B, ukuran kecil. Cocok untuk jus dan sayur campur. Harga ekonomis.',
    price: 5500,
    unit: 'kg',
    grade: 'B',
    quantity: 2000,
    latOffset: -0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 3,
    commodityName: 'Bawang Putih',
    title: 'Bawang Putih lokal Brebes',
    description:
      'Bawang putih lokal dari Brebes. Ukuran sedang, rasa pedas kuat. Cocok untuk bumbu masakan.',
    price: 22000,
    unit: 'kg',
    grade: 'B',
    quantity: 1500,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Bawang Merah',
    title: 'Bawang Merah Segar Brebes',
    description:
      'Bawang merah segar langsung dari petani Brebes. Kualitas bagus untuk kebutuhan dapur dan restoran.',
    price: 35000,
    unit: 'kg',
    grade: 'A',
    quantity: 1200,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 1,
    commodityName: 'Kubis',
    title: 'Kubis Gunung Segar',
    description:
      'Kubis gunung dari Majalaya. Daun hijau pekat, renyah. Cocok untuk bakso dan masakan tumis.',
    price: 4500,
    unit: 'kg',
    grade: 'B',
    quantity: 2500,
    latOffset: 0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 2,
    commodityName: 'Buncis',
    title: 'Buncis Pagaralam Segar',
    description:
      'Buncis segar dari dataran tinggi. Ukuran seragam dan hijau cerah. Cocok untuk masakan restoran.',
    price: 11000,
    unit: 'kg',
    grade: 'A',
    quantity: 700,
    latOffset: -0.01,
    lngOffset: 0.005,
  },
  {
    farmerIndex: 3,
    commodityName: 'Ikan Bandeng',
    title: 'Bandeng Presto Siap Masak',
    description:
      'Bandeng presto siap masak dari demplot peternakan lokal. Lembut dan tulang lunak. Kemasan 500gr.',
    price: 45000,
    unit: 'kg',
    grade: 'A',
    quantity: 300,
    latOffset: 0,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Lele',
    title: 'Lele Jumbo Segar Budidaya',
    description:
      'Lele jumbo budidaya kolam tanah. Ukuran besar 500g-1kg/ekor. Cocok untuk lele goreng dan bakar.',
    price: 26000,
    unit: 'kg',
    grade: 'A',
    quantity: 1200,
    latOffset: 0.005,
    lngOffset: -0.005,
  },
  {
    farmerIndex: 0,
    commodityName: 'Padi (Gabah)',
    title: 'Gabah Padi IR64 Kualitas Tinggi',
    description:
      'Gabah padi IR64 kualitas tinggi, rendemen beras tinggi 62%. Cocok untuk penggilingan besar.',
    price: 6200,
    unit: 'kg',
    grade: 'A',
    quantity: 4000,
    latOffset: -0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 1,
    commodityName: 'Nanas',
    title: 'Nanas Brown Sugar Subang',
    description:
      'Nanas brown sugar dari Subang. Daging kuning, rasa manis karamel. Siap panen dalam seminggu.',
    price: 9500,
    unit: 'kg',
    grade: 'A',
    quantity: 1500,
    latOffset: 0.01,
    lngOffset: -0.01,
    isPreorder: true,
  },
  {
    farmerIndex: 2,
    commodityName: 'Kentang',
    title: 'Kentang Keripik Premium',
    description:
      'Kentang kualitas keripik dari Dieng. Ukuran kecil seragam, rendah kadar air. Cocok untuk industri keripik.',
    price: 8000,
    unit: 'kg',
    grade: 'B',
    quantity: 4000,
    latOffset: 0,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 3,
    commodityName: 'Kopi',
    title: 'Kopi Liberika Riau',
    description:
      'Kopi Liberika dari Riau. Rasa unik smoky dan fruity. Cocok untuk specialty coffee shop.',
    price: 75000,
    unit: 'kg',
    grade: 'A',
    quantity: 300,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Tuna',
    title: 'Tuna Sashimi Grade Lemuru',
    description:
      'Tuna grade sashimi, baru ditangkap dan langsung didinginkan. Fresh dari pelabuhan.',
    price: 95000,
    unit: 'kg',
    grade: 'A',
    quantity: 150,
    latOffset: 0,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 0,
    commodityName: 'Cabai Merah',
    title: 'Cabai Merah Rawit Campur',
    description:
      'Campuran cabai merah dan rawit. Cocok untuk pedagang yang butuh mix. Harga spesial.',
    price: 28000,
    unit: 'kg',
    grade: 'B',
    quantity: 1000,
    latOffset: 0.015,
    lngOffset: -0.01,
  },
  {
    farmerIndex: 1,
    commodityName: 'Pepaya',
    title: 'Pepaya Ginseng Segar',
    description:
      'Pepaya varietas ginseng dari Subang. Rasa manis, daging tebal. Ukuran 1-1.5kg.',
    price: 8500,
    unit: 'kg',
    grade: 'A',
    quantity: 1000,
    latOffset: 0,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 2,
    commodityName: 'Jagung',
    title: 'Jagung Kuning Manis Segar',
    description:
      'Jagung kuning manis petik segar. Cocok untuk rebus dan bakar. Kemasan dozen.',
    price: 8000,
    unit: 'kg',
    grade: 'A',
    quantity: 2500,
    latOffset: 0.01,
    lngOffset: 0.01,
  },
  {
    farmerIndex: 3,
    commodityName: 'Alpukat',
    title: 'Alpukat Hass Import Skala Kecil',
    description:
      'Alpukat varietas Hass, kulit gelap dan daging creamy. Cocok untuk restoran healthy food.',
    price: 45000,
    unit: 'kg',
    grade: 'A',
    quantity: 300,
    latOffset: -0.01,
    lngOffset: 0,
  },
  {
    farmerIndex: 4,
    commodityName: 'Ikan Tongkol',
    title: 'Tongkol Ekor Kuning Segar',
    description:
      'Tongkol ekor kuning segar dari armada perikanan. Ukuran jumbo 2-4kg/ekor.',
    price: 52000,
    unit: 'kg',
    grade: 'A',
    quantity: 400,
    latOffset: 0.01,
    lngOffset: -0.01,
  },
];

async function main() {
  console.log('Cleaning existing data...');

  await prisma.productPhoto.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userCommodity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.commodity.deleteMany();
  await prisma.commodityCategory.deleteMany();
  console.log('Existing data cleaned');

  console.log('Seeding database...');

  // 1. Categories
  const tanamanPangan = await prisma.commodityCategory.create({
    data: { name: 'Tanaman Pangan & Hortikultura' },
  });
  const perkebunan = await prisma.commodityCategory.create({
    data: { name: 'Komoditas Perkebunan Unggulan' },
  });
  const perikanan = await prisma.commodityCategory.create({
    data: { name: 'Komoditas Perikanan' },
  });
  console.log('Categories seeded');

  // 2. Commodities
  const tanamanPanganList = [
    'Padi (Gabah)',
    'Beras',
    'Jagung',
    'Kedelai',
    'Ubi Kayu',
    'Ubi Jalar',
    'Porang',
    'Bawang Merah',
    'Bawang Putih',
    'Cabai Merah',
    'Cabai Rawit',
    'Kubis',
    'Kentang',
    'Tomat',
    'Wortel',
    'Buncis',
    'Kol',
  ];
  const perkebunanList = [
    'Kopi',
    'Buah Kakao',
    'Lada',
    'Cengkih',
    'Biji Pala',
    'Vanili',
    'Nanas',
    'Durian',
    'Mangga',
    'Alpukat',
    'Pepaya',
  ];
  const perikananList = [
    'Ikan Nila',
    'Ikan Mujair',
    'Ikan Lele',
    'Ikan Mas',
    'Ikan Bandeng',
    'Ikan Tuna',
    'Ikan Cakalang',
    'Ikan Tongkol',
    'Ikan Kembung',
    'Ikan Kakap Merah',
  ];

  for (const name of tanamanPanganList)
    await prisma.commodity.create({
      data: { categoryId: tanamanPangan.id, name },
    });
  for (const name of perkebunanList)
    await prisma.commodity.create({
      data: { categoryId: perkebunan.id, name },
    });
  for (const name of perikananList)
    await prisma.commodity.create({ data: { categoryId: perikanan.id, name } });
  console.log('Commodities seeded');

  // 3. Users
  const admin = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin.main@demo.com',
      role: 'admin',
      name: 'Admin PanenLangsung',
      phone: '081234567890',
      address: 'Bandung, Indonesia',
      verificationStatus: 'verified',
    },
  });

  const petaniUsers = [
    {
      id: '00000000-0000-0000-0000-000000000010',
      email: 'budi.santoso@demo.com',
      name: 'Budi Santoso',
      phone: '081234567801',
      address: 'Desa Makmur, Kec. Subur, Kab. Maju, Jawa Tengah',
      latitude: -7.55,
      longitude: 110.55,
      businessName: 'Kelompok Tani Makmur',
      groupFarmerNumber: 'KT-2024-001',
      businessType: 'Kelompok Tani',
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'siti.aminah@demo.com',
      name: 'Siti Aminah',
      phone: '081234567802',
      address: 'Desa Sukamaju, Kec. Tanjung, Kab. Subang, Jawa Barat',
      latitude: -6.56,
      longitude: 107.62,
      businessName: 'Koperasi Tani Sukamaju',
      groupFarmerNumber: 'KT-2024-002',
      businessType: 'Koperasi Tani',
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      email: 'agus.wijaya@demo.com',
      name: 'Agus Wijaya',
      phone: '081234567803',
      address: 'Desa Tani Jaya, Kec. Playen, Kab. Gunung Kidul, DI Yogyakarta',
      latitude: -7.97,
      longitude: 110.63,
      businessName: 'UD Tani Jaya',
      nib: '1234567890124',
      businessType: 'Usaha Tani',
    },
    {
      id: '00000000-0000-0000-0000-000000000013',
      email: 'rina.hartati@demo.com',
      name: 'Rina Hartati',
      phone: '081234567804',
      address: 'Desa Petani, Kec. Kalasan, Kab. Sleman, DI Yogyakarta',
      latitude: -7.76,
      longitude: 110.47,
      businessName: 'Kelompok Tani Sejahtera',
      groupFarmerNumber: 'KT-2024-003',
      businessType: 'Kelompok Tani',
    },
    {
      id: '00000000-0000-0000-0000-000000000014',
      email: 'dodi.pratama@demo.com',
      name: 'Dodi Pratama',
      phone: '081234567805',
      address: 'Kampung Nelayan, Kec. Teluknaga, Kab. Tangerang, Banten',
      latitude: -6.1,
      longitude: 106.58,
      businessName: 'Nelayan Bersatu',
      groupFarmerNumber: 'Nelayan-2024-001',
      businessType: 'Kelompok Nelayan',
    },
  ];

  const pembeliUsers = [
    {
      id: '00000000-0000-0000-0000-000000000020',
      email: 'siti.rahayu@demo.com',
      name: 'Siti Rahayu',
      phone: '081234567810',
      address: 'Jl. Pahlawan No. 10, Kota Bandung, Jawa Barat',
      latitude: -6.92,
      longitude: 107.62,
      businessName: 'Restoran Nusantara Bandung',
      npwp: '12.345.678.9-012.001',
      nib: '1234567890201',
      businessType: 'Restoran',
    },
    {
      id: '00000000-0000-0000-0000-000000000021',
      email: 'herman.kusuma@demo.com',
      name: 'Herman Kusuma',
      phone: '081234567811',
      address: 'Jl. Sudirman No. 55, Kota Semarang, Jawa Tengah',
      latitude: -6.97,
      longitude: 110.41,
      businessName: 'Hotel Grand Semarang',
      npwp: '12.345.678.9-012.002',
      nib: '1234567890202',
      businessType: 'Hotel',
    },
    {
      id: '00000000-0000-0000-0000-000000000022',
      email: 'darma.food@demo.com',
      name: 'Darma Food Industries',
      phone: '081234567812',
      address: 'Jl. Industri Raya No. 20, Kab. Bekasi, Jawa Barat',
      latitude: -6.22,
      longitude: 107.0,
      businessName: 'PT Darma Food Indonesia',
      npwp: '12.345.678.9-012.003',
      nib: '1234567890203',
      businessType: 'Pabrik Makanan',
    },
    {
      id: '00000000-0000-0000-0000-000000000023',
      email: 'exportir.sulawesi@demo.com',
      name: 'Muh. Arifin',
      phone: '081234567813',
      address:
        'Jl. Perintis Kemerdekaan No. 8, Kota Makassar, Sulawesi Selatan',
      latitude: -5.14,
      longitude: 119.43,
      businessName: 'CV Sulawesi Export',
      npwp: '12.345.678.9-012.004',
      nib: '1234567890204',
      businessType: 'Eksportir',
    },
    {
      id: '00000000-0000-0000-0000-000000000024',
      email: 'warung.mama@demo.com',
      name: 'Mama Ani',
      phone: '081234567814',
      address: 'Jl. Pemuda No. 15, Kota Yogyakarta, DI Yogyakarta',
      latitude: -7.8,
      longitude: 110.36,
      businessName: 'Warung Mama Ani',
      npwp: '12.345.678.9-012.005',
      nib: '1234567890205',
      businessType: 'UMKM',
    },
  ];

  const createdPetani = [];
  for (const p of petaniUsers) {
    createdPetani.push(
      await prisma.user.create({
        data: { ...p, role: 'petani', verificationStatus: 'verified' },
      }),
    );
  }
  const createdPembeli = [];
  for (const b of pembeliUsers) {
    createdPembeli.push(
      await prisma.user.create({
        data: { ...b, role: 'pembeli', verificationStatus: 'verified' },
      }),
    );
  }
  console.log('Users seeded');

  // 4. User Commodities
  const allCommodities = await prisma.commodity.findMany();
  const findC = (n: string) => allCommodities.find((c) => c.name === n);
  const userCommodityData = [
    ...[
      'Padi (Gabah)',
      'Beras',
      'Cabai Merah',
      'Bawang Merah',
      'Buah Kakao',
      'Lada',
      'Cengkih',
      'Biji Pala',
      'Vanili',
    ]
      .map((n) => ({
        userId: '00000000-0000-0000-0000-000000000010',
        commodityId: findC(n)!.id,
      }))
      .filter((d) => d.commodityId),
    ...[
      'Bawang Merah',
      'Bawang Putih',
      'Tomat',
      'Cabai Rawit',
      'Nanas',
      'Pepaya',
      'Alpukat',
    ]
      .map((n) => ({
        userId: '00000000-0000-0000-0000-000000000011',
        commodityId: findC(n)!.id,
      }))
      .filter((d) => d.commodityId),
    ...['Jagung', 'Kentang', 'Padi (Gabah)', 'Wortel', 'Nanas']
      .map((n) => ({
        userId: '00000000-0000-0000-0000-000000000012',
        commodityId: findC(n)!.id,
      }))
      .filter((d) => d.commodityId),
    ...[
      'Kubis',
      'Wortel',
      'Buncis',
      'Kol',
      'Tomat',
      'Kopi',
      'Durian',
      'Mangga',
      'Alpukat',
    ]
      .map((n) => ({
        userId: '00000000-0000-0000-0000-000000000013',
        commodityId: findC(n)!.id,
      }))
      .filter((d) => d.commodityId),
    ...[
      'Ubi Jalar',
      'Ubi Kayu',
      'Kedelai',
      'Mangga',
      'Ikan Nila',
      'Ikan Lele',
      'Ikan Tuna',
      'Ikan Tongkol',
      'Ikan Bandeng',
      'Ikan Cakalang',
      'Ikan Kembung',
      'Ikan Kakap Merah',
      'Ikan Mas',
      'Ikan Mujair',
    ]
      .map((n) => ({
        userId: '00000000-0000-0000-0000-000000000014',
        commodityId: findC(n)!.id,
      }))
      .filter((d) => d.commodityId),
  ];
  await prisma.userCommodity.createMany({ data: userCommodityData });
  console.log('User commodities seeded');

  // 5. Products with photos
  let photoIndex = 0;
  for (const p of PRODUCTS) {
    const commodity = findC(p.commodityName);
    if (!commodity) continue;
    const farmer = createdPetani[p.farmerIndex];
    const loc = LATITUDES[p.farmerIndex];
    const product = await prisma.product.create({
      data: {
        farmerId: farmer.id,
        commodityId: commodity.id,
        title: p.title,
        description: p.description,
        price: p.price,
        unit: p.unit,
        grade: p.grade,
        quantityAvailable: p.quantity,
        isPreorder: p.isPreorder || false,
        latitude: loc.lat + (p.latOffset || 0),
        longitude: loc.lng + (p.lngOffset || 0),
        status: p.isPreorder ? 'pre_order' : 'aktif',
      },
    });

    // Add 1-2 photos
    const photoUrl = pickPhoto(p.commodityName, photoIndex);
    await prisma.productPhoto.create({
      data: { productId: product.id, fileUrl: photoUrl, isPrimary: true },
    });

    const secondPhoto = pickPhoto(p.commodityName, photoIndex + 1);
    if (secondPhoto !== photoUrl) {
      await prisma.productPhoto.create({
        data: { productId: product.id, fileUrl: secondPhoto, isPrimary: false },
      });
    }
    photoIndex++;
  }

  console.log(`Products seeded: ${PRODUCTS.length}`);
  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
