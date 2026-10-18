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
        {value === "Y" ? t("yes") : value === "N" ? t("no") : 'N/A'}
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
                  🧭 {t("navigation")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("mapping", robot.mapping)}
              {renderStringTableRow("mappingSensorType", robot.mappingSensorType, "")}
              {renderBooleanStringTableRow("highPrecisionMap", robot.highPrecisionMap)}
              {renderBooleanStringTableRow("ai", robot.ai)}
              {renderBooleanStringTableRow("magneticVirtualWalls", robot.control.magneticVirtualWalls)}
              {renderStringTableRow("barrierCrossHeight", robot.cleaningFeatures.barrierCrossHeight, "mm")}
              {renderStringTableRow("cleaningArea", robot.cleaningFeatures.cleaningArea, "m&sup2;")}
              {renderBooleanStringTableRow("cliffSensor", robot.sensor.cliffSensor)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧹 {t("cleaningFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("suctionPower", robot.cleaningFeatures.suctionPower, "Pa")}
              {renderStringTableRow("dustbinCapacity", robot.cleaningFeatures.dustbinCapacity, "ml")}
              {renderBooleanStringTableRow("autoDirtDisposal", robot.cleaningFeatures.autoDirtDisposal)}
              {renderStringTableRow("disposableDustBagCapacity", robot.cleaningFeatures.disposableDustBagCapacity, "L")}
              {renderBooleanStringTableRow("hepaFilter", robot.cleaningFeatures.hepaFilter)}
              {renderBooleanStringTableRow("washableFilter", robot.cleaningFeatures.washableFilter)}
              {renderStringTableRow("sideBrushes", robot.sideBrushes, "")}
              {renderBooleanStringTableRow("carpetBoost", robot.sensor.carpetBoost)}
              {/* {renderBooleanStringTableRow("Dirt Sensor", robot.sensor.dirtSensor)} */}
              {/* {renderBooleanStringTableRow("Full Dustbin Sensor",robot.sensor.fullDustbinSensor)} */}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧽 {t("moppingFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("wetMopping", robot.moppingFeatures.wetMopping)}
              {renderBooleanStringTableRow("electricWaterFlowControl", robot.moppingFeatures.electricWaterFlowControl)}
              {renderStringTableRow("waterTankCapacity", robot.moppingFeatures.waterTankCapacity, "ml")}
              {renderBooleanStringTableRow("vibratingMoppingPad", robot.moppingFeatures.vibratingMoppingPad)}
              {renderBooleanStringTableRow("autoMopLifting", robot.moppingFeatures.autoMopLifting)}
              {renderBooleanStringTableRow("autoWaterTankRefilling", robot.moppingFeatures.autoWaterTankRefilling)}
              {renderBooleanStringTableRow("autoMopWashing", robot.moppingFeatures.autoMopWashing)}
              {renderBooleanStringTableRow("spinningMops", robot.moppingFeatures.spinningMops)}
              {renderBooleanStringTableRow("washingMopsWithWarmWater", robot.moppingFeatures.washingMopsWithWarmWater)}
              {renderBooleanStringTableRow("dryingTheMops", robot.moppingFeatures.dryingTheMops)}
              {renderBooleanStringTableRow("automaticDetergentDosing", robot.moppingFeatures.automaticDetergentDosing)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🔋 {t("battery")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("batteryCapacity", robot.battery.batteryCapacity, "mAh")}
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
                  ⚙ {t("control")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("wifiSmartphoneApp", robot.control.wifiSmartphoneApp)}
              {/* {renderBooleanStringTableRow("scheduling", robot.control.scheduling)} */}
              {/* {renderBooleanStringTableRow("IR/RF Remote Control",robot.control.irRfRemoteControl)} */}
              {renderStringTableRow("wifiFrequencyBand", robot.control.wifiFrequencyBand, "GHz")}
              {renderBooleanStringTableRow("amazonAlexaSupport", robot.control.amazonAlexaSupport)}
              {renderBooleanStringTableRow("googleAssistantSupport", robot.control.googleAssistantSupport)}
              {/* {renderBooleanStringTableRow("display", robot.display)} */}
              {renderBooleanStringTableRow("voicePrompts", robot.voicePrompts)}
              {renderStringTableRow("noiseLevel", robot.noiseLevel, "")}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  📱 {t("appFeatures")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("realTimeTracking", robot.appFeatures.realTimeTracking)}
              {renderBooleanStringTableRow("digitalBlockedAreas", robot.appFeatures.digitalBlockedAreas)}
              {renderBooleanStringTableRow("zonedCleaning", robot.appFeatures.zonedCleaning)}
              {renderBooleanStringTableRow("multiFloorMaps", robot.appFeatures.multiFloorMaps)}
              {/* {renderBooleanStringTableRow("Manual movement control",robot.appFeatures.manualMovementControl)} */}
              {renderBooleanStringTableRow("selectedRoomCleaning", robot.appFeatures.selectedRoomCleaning)}
              {renderBooleanStringTableRow("noMopZones", robot.appFeatures.noMopZones)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  {t("otherSpecifications")}
                </th>
              </tr>
            </thead>
            <tbody>
              {renderStringTableRow("weight", robot.otherSpecifications.weight, "kg")}
              {renderStringTableRow("width", robot.otherSpecifications.width, "cm")}
              {renderStringTableRow("height", robot.otherSpecifications.height, "cm")}
              {/* {renderStringTableRow("In the box",robot.otherSpecifications.inTheBox,"")} */}
              <tr>
                <th>{t("releaseDate")}</th>
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
                    {t("dockSpecifications")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderStringTableRow("weight", robot.dockSpecifications?.weight, "kg")}
                {renderStringTableRow("width", robot.dockSpecifications?.width, "cm")}
                {renderStringTableRow("height", robot.dockSpecifications?.height, "cm")}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default RobotDetails;
