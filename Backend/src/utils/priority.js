export const calculatePriority = (energyLevel, basePriority = 5) => {
  let multiplier = 1;

  switch (energyLevel) {
    case 'low':
      multiplier = 0.8; // Lower priority for low energy
      break;
    case 'medium':
      multiplier = 1; // Default
      break;
    case 'high':
      multiplier = 1.2; // Higher priority for high energy
      break;
    default:
      multiplier = 1;
  }

  const calculatedPriority = Math.round(basePriority * multiplier);
  return Math.max(1, Math.min(10, calculatedPriority)); // Clamp between 1 and 10
};
