// Each spec's label/description i18n keys are the last segment of its field path
// (e.g. 'cleaningFeatures.suctionPower' -> t('suctionPower'), t('suctionPowerDesc')).
export const specsConfig = [
  // General specifications
  { field: 'mapping' },
  { field: 'mappingSensorType' },
  { field: 'highPrecisionMap' },
  { field: 'ai' },
  { field: 'noiseLevel', unit: 'dB' },
  { field: 'sideBrushes' },
  { field: 'voicePrompts' },

  // Cleaning Features
  { section: 'cleaningFeatures', icon: '🧹' },
  { field: 'cleaningFeatures.suctionPower', unit: 'Pa' },
  { field: 'cleaningFeatures.cleaningArea', unit: 'm²' },
  { field: 'cleaningFeatures.dustbinCapacity', unit: 'ml' },
  { field: 'cleaningFeatures.disposableDustBagCapacity', unit: 'L' },
  { field: 'cleaningFeatures.autoDirtDisposal' },
  { field: 'cleaningFeatures.barrierCrossHeight', unit: 'mm' },
  { field: 'cleaningFeatures.hepaFilter' },
  { field: 'cleaningFeatures.washableFilter' },

  // Mopping Features
  { section: 'moppingFeatures', icon: '🧽' },
  { field: 'moppingFeatures.wetMopping' },
  { field: 'moppingFeatures.electricWaterFlowControl' },
  { field: 'moppingFeatures.waterTankCapacity', unit: 'ml' },
  { field: 'moppingFeatures.vibratingMoppingPad' },
  { field: 'moppingFeatures.autoMopLifting' },
  { field: 'moppingFeatures.autoWaterTankRefilling' },
  { field: 'moppingFeatures.autoMopWashing' },

  // Battery
  { section: 'battery', icon: '🔋' },
  { field: 'battery.batteryCapacity', unit: 'mAh' },
  // { field: 'battery.batteryLife', unit: 'min' },
  // { field: 'battery.chargingTime', unit: 'min' },
  // { field: 'battery.ratedPower', unit: 'W' },

  // Control
  { section: 'control', icon: '⚙' },
  // { field: 'control.scheduling' },
  { field: 'control.wifiSmartphoneApp' },
  { field: 'control.wifiFrequencyBand', unit: 'GHz' },
  { field: 'control.amazonAlexaSupport' },
  { field: 'control.googleAssistantSupport' },
  { field: 'control.magneticVirtualWalls' },

  // App Features
  { section: 'appFeatures', icon: '📱' },
  { field: 'appFeatures.realTimeTracking' },
  { field: 'appFeatures.digitalBlockedAreas' },
  { field: 'appFeatures.zonedCleaning' },
  { field: 'appFeatures.multiFloorMaps' },
  { field: 'appFeatures.selectedRoomCleaning' },
  { field: 'appFeatures.noMopZones' },

  // Sensor
  { section: 'sensor', icon: '📡' },
  { field: 'sensor.carpetBoost' },
  { field: 'sensor.cliffSensor' },

  // Other Specifications
  { section: 'otherSpecifications' },
  { field: 'otherSpecifications.weight', unit: 'kg' },
  { field: 'otherSpecifications.width', unit: 'cm' },
  { field: 'otherSpecifications.height', unit: 'cm' },
  { field: 'otherSpecifications.releaseDate', custom: 'releaseDate' },

  // Dock Specifications
  { section: 'dockSpecifications' },
  { field: 'dockSpecifications.weight', unit: 'kg' },
  { field: 'dockSpecifications.width', unit: 'cm' },
  { field: 'dockSpecifications.height', unit: 'cm' }
];
