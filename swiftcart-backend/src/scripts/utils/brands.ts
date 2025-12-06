import { faker } from '@faker-js/faker';

/**
 * Real-world brands organized by category
 */
export const brands = {
  electronics: {
    computers: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft', 'Samsung'],
    phones: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Motorola', 'Nokia'],
    audio: ['Sony', 'Bose', 'JBL', 'Sennheiser', 'Audio-Technica', 'Beats', 'Jabra', 'Anker'],
    cameras: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus', 'GoPro'],
    gaming: ['PlayStation', 'Xbox', 'Nintendo', 'SteelSeries', 'Razer', 'Logitech', 'Corsair'],
    smartHome: ['Amazon', 'Google', 'Philips Hue', 'Ring', 'Nest', 'Echo', 'Sonos'],
  },
  fashion: {
    clothing: ['Nike', 'Adidas', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Zara', 'H&M'],
    shoes: ['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse', 'Vans', 'Reebok', 'Skechers'],
    accessories: ['Fossil', 'Michael Kors', 'Coach', 'Kate Spade', 'Tiffany & Co.', 'Pandora'],
  },
  home: {
    kitchen: ['KitchenAid', 'Cuisinart', 'Instant Pot', 'Ninja', 'Breville', 'Keurig', 'Hamilton Beach'],
    furniture: ['IKEA', 'Ashley', 'Wayfair', 'West Elm', 'Pottery Barn', 'La-Z-Boy'],
    decor: ['Anthropologie', 'Crate & Barrel', 'HomeGoods', 'Target', 'Bed Bath & Beyond'],
  },
  sports: {
    fitness: ['Nike', 'Adidas', 'Under Armour', 'Reebok', 'Lululemon', 'Gymshark', 'Peloton'],
    outdoor: ['The North Face', 'Patagonia', 'Columbia', 'REI', 'Coleman', 'Yeti'],
  },
  beauty: {
    makeup: ['Maybelline', 'L\'Oréal', 'MAC', 'NARS', 'Urban Decay', 'Fenty Beauty', 'Too Faced'],
    skincare: ['CeraVe', 'Neutrogena', 'Olay', 'La Roche-Posay', 'The Ordinary', 'Clinique'],
  },
  default: ['Premium', 'Pro', 'Elite', 'Professional', 'Advanced'],
};

/**
 * Get a random brand for a category
 */
export function getBrand(category: string, subcategory: string): string {
  const categoryLower = category.toLowerCase();
  const subcategoryLower = subcategory.toLowerCase();

  // Electronics
  if (categoryLower.includes('electronics') || categoryLower.includes('computer')) {
    if (subcategoryLower.includes('phone') || subcategoryLower.includes('mobile')) {
      return faker.helpers.arrayElement(brands.electronics.phones);
    }
    if (subcategoryLower.includes('laptop') || subcategoryLower.includes('computer')) {
      return faker.helpers.arrayElement(brands.electronics.computers);
    }
    if (subcategoryLower.includes('audio') || subcategoryLower.includes('headphone') || subcategoryLower.includes('speaker')) {
      return faker.helpers.arrayElement(brands.electronics.audio);
    }
    if (subcategoryLower.includes('camera') || subcategoryLower.includes('photo')) {
      return faker.helpers.arrayElement(brands.electronics.cameras);
    }
    if (subcategoryLower.includes('gaming') || subcategoryLower.includes('game')) {
      return faker.helpers.arrayElement(brands.electronics.gaming);
    }
    if (subcategoryLower.includes('smart')) {
      return faker.helpers.arrayElement(brands.electronics.smartHome);
    }
  }

  // Fashion
  if (categoryLower.includes('fashion') || categoryLower.includes('clothing') || categoryLower.includes('shoes')) {
    if (subcategoryLower.includes('shoe')) {
      return faker.helpers.arrayElement(brands.fashion.shoes);
    }
    if (subcategoryLower.includes('clothing') || subcategoryLower.includes('dress') || subcategoryLower.includes('shirt')) {
      return faker.helpers.arrayElement(brands.fashion.clothing);
    }
    if (subcategoryLower.includes('jewelry') || subcategoryLower.includes('watch') || subcategoryLower.includes('accessory')) {
      return faker.helpers.arrayElement(brands.fashion.accessories);
    }
  }

  // Home & Kitchen
  if (categoryLower.includes('home') || categoryLower.includes('kitchen')) {
    if (subcategoryLower.includes('kitchen') || subcategoryLower.includes('dining')) {
      return faker.helpers.arrayElement(brands.home.kitchen);
    }
    if (subcategoryLower.includes('furniture')) {
      return faker.helpers.arrayElement(brands.home.furniture);
    }
    if (subcategoryLower.includes('decor') || subcategoryLower.includes('bedding')) {
      return faker.helpers.arrayElement(brands.home.decor);
    }
  }

  // Sports
  if (categoryLower.includes('sports') || categoryLower.includes('fitness') || categoryLower.includes('outdoor')) {
    if (subcategoryLower.includes('fitness') || subcategoryLower.includes('exercise')) {
      return faker.helpers.arrayElement(brands.sports.fitness);
    }
    if (subcategoryLower.includes('outdoor') || subcategoryLower.includes('camping')) {
      return faker.helpers.arrayElement(brands.sports.outdoor);
    }
  }

  // Beauty
  if (categoryLower.includes('beauty') || categoryLower.includes('makeup') || categoryLower.includes('skincare')) {
    if (subcategoryLower.includes('makeup')) {
      return faker.helpers.arrayElement(brands.beauty.makeup);
    }
    if (subcategoryLower.includes('skin') || subcategoryLower.includes('care')) {
      return faker.helpers.arrayElement(brands.beauty.skincare);
    }
  }

  return faker.helpers.arrayElement(brands.default);
}

