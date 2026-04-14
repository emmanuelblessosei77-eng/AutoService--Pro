import brakePadImg from '../images/brake pad set.jpg';
import airFilterImg from '../images/airfilterreplacement.jpg';
import transmissionFluidImg from '../images/transmissionfluid.jpg';
import premiumOilImg from '../images/premium oil filter.jpg';
import batteryImg from '../images/battery.jpg';
import alternatorImg from '../images/altenator.jpg';
import shockImg from '../images/shock absorber.jpg';
import tireImg from '../images/tire-114259_1920.jpg';

const PART_IMAGES: Record<string, string> = {
  'brake pad': brakePadImg,
  'brake pad set': brakePadImg,
  'air filter': airFilterImg,
  'air filter replacement': airFilterImg,
  'transmission fluid': transmissionFluidImg,
  'premium oil filter': premiumOilImg,
  'oil filter': premiumOilImg,
  'battery': batteryImg,
  'car battery': batteryImg,
  'alternator': alternatorImg,
  'shock absorber': shockImg,
  'tire': tireImg,
  'tyre': tireImg,
};

export function resolvePartImage(name: string, imageUrl?: string | null): string | null {
  if (!name) return imageUrl ?? null;
  const key = name.toLowerCase();
  for (const [matchKey, image] of Object.entries(PART_IMAGES)) {
    if (key.includes(matchKey)) return image;
  }
  return imageUrl ?? null;
}