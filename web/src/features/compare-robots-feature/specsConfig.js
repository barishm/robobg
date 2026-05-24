export const specsConfig = [
  // General specifications
  { textKey: 'mapping', field: 'mapping' },
  { textKey: 'mappingSensorType', field: 'mappingSensorType' },
  { textKey: 'highPrecisionMap', field: 'highPrecisionMap' },
  { textKey: 'noiseLevel', field: 'noiseLevel', unit: 'dB' },
  { textKey: 'sideBrushes', field: 'sideBrushes' },
  { textKey: 'voicePrompts', field: 'voicePrompts' },

  // Cleaning Features
  { section: '🧹 Cleaning Features' },
  { textKey: 'suctionPower', field: 'cleaningFeatures.suctionPower', unit: 'Pa' },
  { textKey: 'cleaningArea', field: 'cleaningFeatures.cleaningArea', unit: 'm²' },
  { textKey: 'dustbinCapacity', field: 'cleaningFeatures.dustbinCapacity', unit: 'ml' },
  { textKey: 'disposableDustBagCapacity', field: 'cleaningFeatures.disposableDustBagCapacity', unit: 'L' },
  { textKey: 'autoDirtDisposal', field: 'cleaningFeatures.autoDirtDisposal' },
  { textKey: 'barrierCrossHeight', field: 'cleaningFeatures.barrierCrossHeight', unit: 'mm' },
  { textKey: 'hepaFilter', field: 'cleaningFeatures.hepaFilter' },
  { textKey: 'washableFilter', field: 'cleaningFeatures.washableFilter' },

  // Mopping Features
  { section: '🧽 Mopping features' },
  { textKey: 'wetMopping', field: 'moppingFeatures.wetMopping' },
  { textKey: 'electricWaterFlowControl', field: 'moppingFeatures.electricWaterFlowControl' },
  { textKey: 'waterTankCapacity', field: 'moppingFeatures.waterTankCapacity', unit: 'ml' },
  { textKey: 'vibratingMoppingPad', field: 'moppingFeatures.vibratingMoppingPad' },
  { textKey: 'autoMopLifting', field: 'moppingFeatures.autoMopLifting' },
  { textKey: 'autoWaterTankRefilling', field: 'moppingFeatures.autoWaterTankRefilling' },
  { textKey: 'autoMopWashing', field: 'moppingFeatures.autoMopWashing' },

  // Battery
  { section: '🔋 Battery' },
  { textKey: 'batteryCapacity', field: 'battery.batteryCapacity', unit: 'mAh' },
  // { textKey: 'batteryLife', field: 'battery.batteryLife', unit: 'min' },
  // { textKey: 'chargingTime', field: 'battery.chargingTime', unit: 'min' },
  // { textKey: 'ratedPower', field: 'battery.ratedPower', unit: 'W' },

  // Control
  { section: '⚙ Control' },
  // { textKey: 'scheduling', field: 'control.scheduling' },
  { textKey: 'wifiSmartphoneApp', field: 'control.wifiSmartphoneApp' },
  { textKey: 'wifiFrequencyBand', field: 'control.wifiFrequencyBand', unit: 'GHz' },
  { textKey: 'amazonAlexaSupport', field: 'control.amazonAlexaSupport' },
  { textKey: 'googleAssistantSupport', field: 'control.googleAssistantSupport' },
  { textKey: 'magneticVirtualWalls', field: 'control.magneticVirtualWalls' },

  // App Features
  { section: '📱App Features' },
  { textKey: 'realTimeTracking', field: 'appFeatures.realTimeTracking' },
  { textKey: 'digitalBlockedAreas', field: 'appFeatures.digitalBlockedAreas' },
  { textKey: 'zonedCleaning', field: 'appFeatures.zonedCleaning' },
  { textKey: 'multiFloorMaps', field: 'appFeatures.multiFloorMaps' },
  { textKey: 'selectedRoomCleaning', field: 'appFeatures.selectedRoomCleaning' },
  { textKey: 'noMopZones', field: 'appFeatures.noMopZones' },

  // Sensor
  { section: '📡Sensor' },
  { textKey: 'carpetBoost', field: 'sensor.carpetBoost' },
  { textKey: 'cliffSensor', field: 'sensor.cliffSensor' },

  // Other Specifications
  { section: 'Other Specifications' },
  { textKey: 'weight', field: 'otherSpecifications.weight', unit: 'kg' },
  { textKey: 'width', field: 'otherSpecifications.width', unit: 'cm' },
  { textKey: 'height', field: 'otherSpecifications.height', unit: 'cm' },
  { textKey: 'releaseDate', field: 'otherSpecifications.releaseDate', custom: 'releaseDate' },
];
