import ReleaseDateDisplay from "src/components/ReleaseDateDisplay";
import { useTranslation } from "react-i18next";

const RobotDetails = (props) => {
  const { t } = useTranslation()
  const { robot } = props;

  const renderBooleanStringTableRow = (label, value) => (
    <tr>
      <th style={{ width: '50%' }}>{t(label)}</th>
      <td
        style={{
          width: '50%',
          color: value === "Y" ? 'green' : value === "N" ? 'red' : 'gray',
        }}
      >
        {value === "Y" ? 'YES' : value === "N" ? 'NO' : 'N/A'}
      </td>
    </tr>
  );

  const renderStringTableRow = (label, value, addition) => (
    <tr>
      <th style={{ width: "50%" }}>{t(label)}</th>
      <td>
        {value === null ? (
          "N/A"
        ) : (
          <span dangerouslySetInnerHTML={{ __html: `${value} ${addition}` }} />
        )}
      </td>
    </tr>
  );

  return (
    <div className="mt-4">
      {robot && (
        <>
          <h5 className="fw-bolder" style={{ marginBottom: "10px" }}>
            {t("specsAndFeatures")}
          </h5>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧭 {t("Navigation")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("MappingPathplanning", robot.mapping)}
              {renderStringTableRow("MappingSensorType", robot.mappingSensorType, "")}
              {renderBooleanStringTableRow("HighPrecisionMap", robot.highPrecisionMap)}
              {renderBooleanStringTableRow("AI", robot.ai)}
              {renderBooleanStringTableRow("MagneticOpticalVirtualWalls", robot.control.magneticVirtualWalls)}
              {renderStringTableRow("BarrierCrossHeight", robot.cleaningFeatures.barrierCrossHeight, "mm")}
              {renderStringTableRow("CleaningArea", robot.cleaningFeatures.cleaningArea, "m&sup2;")}
              {renderBooleanStringTableRow("AntiDropCliffSensor", robot.sensor.cliffSensor)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧹 {t("CleaningFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("SuctionPower", robot.cleaningFeatures.suctionPower, "Pa")}
              {renderStringTableRow("DustbinCapacity", robot.cleaningFeatures.dustbinCapacity, "ml")}
              {renderBooleanStringTableRow("AutomaticDirtDisposal", robot.cleaningFeatures.autoDirtDisposal)}
              {renderStringTableRow("AutomaticDirtDisposal", robot.cleaningFeatures.disposableDustBagCapacity, "L")}
              {renderBooleanStringTableRow("HEPAfilter", robot.cleaningFeatures.hepaFilter)}
              {renderBooleanStringTableRow("WashableFilter", robot.cleaningFeatures.washableFilter)}
              {renderStringTableRow("SideBrushes", robot.sideBrushes, "")}
              {renderBooleanStringTableRow("CarpetBoost", robot.sensor.carpetBoost)}
              {/* {renderBooleanStringTableRow("Dirt Sensor", robot.sensor.dirtSensor)} */}
              {/* {renderBooleanStringTableRow("Full Dustbin Sensor",robot.sensor.fullDustbinSensor)} */}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧽 {t("MoppingFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("WetMopping", robot.moppingFeatures.wetMopping)}
              {renderBooleanStringTableRow("ElectricWaterFlowControl", robot.moppingFeatures.electricWaterFlowControl)}
              {renderStringTableRow("WaterTankCapacity", robot.moppingFeatures.waterTankCapacity, "ml")}
              {renderBooleanStringTableRow("VibratingMoppingPad", robot.moppingFeatures.vibratingMoppingPad)}
              {renderBooleanStringTableRow("AutomaticMopLifting", robot.moppingFeatures.autoMopLifting)}
              {renderBooleanStringTableRow("AutoWaterTankRefilling", robot.moppingFeatures.autoWaterTankRefilling)}
              {renderBooleanStringTableRow("AutoMopWashing", robot.moppingFeatures.autoMopWashing)}
              {renderBooleanStringTableRow("SpinningMops", robot.moppingFeatures.spinningMops)}
              {renderBooleanStringTableRow("WashingMopsWithWarmWater", robot.moppingFeatures.washingMopsWithWarmWater)}
              {renderBooleanStringTableRow("DryingTheMops", robot.moppingFeatures.dryingTheMops)}
              {renderBooleanStringTableRow("AutomaticDetergentDosing", robot.moppingFeatures.automaticDetergentDosing)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🔋 {t("Battery")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("BatteryCapacity", robot.battery.batteryCapacity, "mAh")}
              {/* {renderStringTableRow("Battery life",robot.battery.batteryLife,"min")} */}
              {/* {renderBooleanStringTableRow("Recharge & Resume", robot.rechargeResume)} */}
              {/* {renderStringTableRow("Charging Time", robot.battery.chargingTime, "min")} */}
              {/* {renderBooleanStringTableRow("Autocally Docks and Recharges",robot.autoDockAndRecharge)} */}
              {/* {renderStringTableRow("Rated Power (Watts)",robot.battery.ratedPower, 'W')} */}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th
                  colSpan="2"
                  style={{ backgroundColor: "rgb(240, 240, 240)" }}
                >
                  ⚙ {t("UsabilityControl")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("WiFiSmartphoneApp", robot.control.wifiSmartphoneApp)}
              {/* {renderBooleanStringTableRow("Scheduling", robot.control.scheduling)} */}
              {/* {renderBooleanStringTableRow("IR/RF Remote Control",robot.control.irRfRemoteControl)} */}
              {renderStringTableRow("WiFiFrequencyBand", robot.control.wifiFrequencyBand, "GHz")}
              {renderBooleanStringTableRow("AmazonAlexaSupport", robot.control.amazonAlexaSupport)}
              {renderBooleanStringTableRow("GoogleAssistantSupport", robot.control.googleAssistantSupport)}
              {/* {renderBooleanStringTableRow("Display", robot.display)} */}
              {renderBooleanStringTableRow("VoicePrompts", robot.voicePrompts)}
              {renderStringTableRow("NoiseLevel", robot.noiseLevel, "")}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  📱 {t("AppFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("RealTimeTracking", robot.appFeatures.realTimeTracking)}
              {renderBooleanStringTableRow("DigitalBlockedAreas", robot.appFeatures.digitalBlockedAreas)}
              {renderBooleanStringTableRow("ZonedCleaning", robot.appFeatures.zonedCleaning)}
              {renderBooleanStringTableRow("MultiFloorMaps", robot.appFeatures.multiFloorMaps)}
              {/* {renderBooleanStringTableRow("Manual movement control",robot.appFeatures.manualMovementControl)} */}
              {renderBooleanStringTableRow("SelectedRoomCleaning", robot.appFeatures.selectedRoomCleaning)}
              {renderBooleanStringTableRow("NoMopZones", robot.appFeatures.noMopZones)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  {t("OtherSpecifications")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("Weight", robot.otherSpecifications.weight, "kg")}
              {renderStringTableRow("Width", robot.otherSpecifications.width, "cm")}
              {renderStringTableRow("Height", robot.otherSpecifications.height, "cm")}
              {/* {renderStringTableRow("In the box",robot.otherSpecifications.inTheBox,"")} */}
              <tr>
                <th>{t("ReleaseDate")}</th>
                <td>
                  <ReleaseDateDisplay
                    releaseDate={robot.otherSpecifications.releaseDate} />
                </td>
              </tr>
            </tbody>
          </table>
          {robot.dockSpecifications && (
            <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
              <thead>
                <tr>
                  <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                    {t("DockSpecifications")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderStringTableRow("Weight", robot.dockSpecifications?.weight, "kg")}
                {renderStringTableRow("Width", robot.dockSpecifications?.width, "cm")}
                {renderStringTableRow("Height", robot.dockSpecifications?.height, "cm")}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default RobotDetails;
