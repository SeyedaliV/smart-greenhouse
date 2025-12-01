// محاسبات مربوط به گیاهان

// محاسبه daysUntilHarvest
export const calculateDaysUntilHarvest = (plant) => {
  let daysUntilHarvest;
  
  if (plant.estimatedHarvestDate) {
    const harvestDate = new Date(plant.estimatedHarvestDate);
    const today = new Date();
    daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
  } else if (plant.plantingDate && plant.daysToMature) {
    const plantingDate = new Date(plant.plantingDate);
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + plant.daysToMature);
    const today = new Date();
    daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
  } else {
    daysUntilHarvest = plant.daysToMature || 'N/A';
  }
  
  if (typeof daysUntilHarvest === 'number' && daysUntilHarvest < 0) {
    daysUntilHarvest = 0;
  }
  
  return daysUntilHarvest;
};

// گرفتن وضعیت harvest
export const getHarvestStatus = (daysUntilHarvest) => {
  if (daysUntilHarvest === 'N/A') {
    return { text: 'N/A', color: 'text-zinc-600', badgeColor: 'bg-zinc-100 text-zinc-800' };
  }
  
  if (daysUntilHarvest === 0) {
    return { text: 'Ready!', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-800' };
  }
  
  if (daysUntilHarvest <= 7) {
    return { text: `${daysUntilHarvest} days`, color: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-800' };
  }
  
  return { text: `${daysUntilHarvest} days`, color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-800' };
};

// محاسبه تاریخ harvest
export const calculateHarvestDate = (plant) => {
  if (plant.estimatedHarvestDate) {
    return new Date(plant.estimatedHarvestDate);
  }
  
  if (plant.plantingDate && plant.daysToMature) {
    const plantingDate = new Date(plant.plantingDate);
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + plant.daysToMature);
    return harvestDate;
  }
  
  return null;
};

// گرفتن وضعیت کامل گیاه
export const getPlantStatus = (plant) => {
  const daysUntilHarvest = calculateDaysUntilHarvest(plant);
  const harvestStatus = getHarvestStatus(daysUntilHarvest);
  const harvestDate = calculateHarvestDate(plant);
  
  return {
    daysUntilHarvest,
    harvestStatus,
    harvestDate: harvestDate ? harvestDate.toLocaleDateString() : 'N/A',
    statusBadge: plant.status === 'optimal' ? 'bg-green-100 text-green-800' :
                 plant.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                 'bg-red-100 text-red-800'
  };
};