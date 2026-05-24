import ReleaseDateDisplay from "src/components/ReleaseDateDisplay";
import { useTranslation } from "react-i18next";

const RobotDetails = (props) => {
  const { t } = useTranslation()
  const { robot } = props;

    const renderBooleanStringTableRow = (label, value) => (
    <tr>
      <th style={{ width: '50%' }}>{label}</th>
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
      <th style={{ width: "50%" }}>{label}</th>
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
                  🧭 Navigation
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("Mapping / Path planning", robot.mapping)}
              {renderStringTableRow("Mapping Sensor Type",robot.mappingSensorType,"")}
              {renderBooleanStringTableRow("High-Precision Map",robot.highPrecisionMap)}
              {/* {renderBooleanStringTableRow("Objects recognition (front camera)",robot.frontCamera)} */}
              {renderBooleanStringTableRow("Magnetic/Optical Virtual Walls",robot.control.magneticVirtualWalls)}
              {renderStringTableRow("Barrier-cross Height",robot.cleaningFeatures.barrierCrossHeight,"mm")}
              {renderStringTableRow("Сleaning Area",robot.cleaningFeatures.cleaningArea,"m&sup2;")}
              {renderBooleanStringTableRow("Anti-drop / Cliff Sensor",robot.sensor.cliffSensor)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2"style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧹 Cleaning Features
                </th>
              </tr>
            </thead>
            <tbody>
            {renderStringTableRow("Suction Power",robot.cleaningFeatures.suctionPower,"Pa")}
            {renderStringTableRow("Dustbin Capacity",robot.cleaningFeatures.dustbinCapacity,"ml")}
            {renderBooleanStringTableRow("Automatic Dirt Disposal",robot.cleaningFeatures.autoDirtDisposal)}
            {renderStringTableRow("Disposable dustbag capacity",robot.cleaningFeatures.disposableDustBagCapacity,"L")}
            {renderBooleanStringTableRow("HEPA filter",robot.cleaningFeatures.hepaFilter)}
            {renderBooleanStringTableRow("Washable Filter",robot.cleaningFeatures.washableFilter)}
            {renderStringTableRow("Side Brushes (one or two)",robot.sideBrushes,"")}
            {renderBooleanStringTableRow("Carpet Boost", robot.sensor.carpetBoost)}
            {/* {renderBooleanStringTableRow("Dirt Sensor", robot.sensor.dirtSensor)} */}
            {/* {renderBooleanStringTableRow("Full Dustbin Sensor",robot.sensor.fullDustbinSensor)} */}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🧽 Mopping features
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("Wet Mopping",robot.moppingFeatures.wetMopping)}
              {renderBooleanStringTableRow("Electric water flow control",robot.moppingFeatures.electricWaterFlowControl)}
              {renderStringTableRow("Water Tank Capacity",robot.moppingFeatures.waterTankCapacity,"ml")}
              {renderBooleanStringTableRow("Vibrating mopping pad",robot.moppingFeatures.vibratingMoppingPad)}
              {renderBooleanStringTableRow("Automatic mop lifting",robot.moppingFeatures.autoMopLifting)}
              {renderBooleanStringTableRow("Auto water tank refilling",robot.moppingFeatures.autoWaterTankRefilling)}
              {renderBooleanStringTableRow("Auto mop washing",robot.moppingFeatures.autoMopWashing)}
              {renderBooleanStringTableRow("Spinning Mops",robot.moppingFeatures.spinningMops)}
              {renderBooleanStringTableRow("Washing Mops With WarmWater",robot.moppingFeatures.washingMopsWithWarmWater)}
              {renderBooleanStringTableRow("Drying The Mops",robot.moppingFeatures.dryingTheMops)}
              {renderBooleanStringTableRow("Automatic Detergent Dosing",robot.moppingFeatures.automaticDetergentDosing)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  🔋 Battery
                </th>
              </tr>
            </thead>
            <tbody>
            {renderStringTableRow("Battery Capacity",robot.battery.batteryCapacity,"mAh")}
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
                  ⚙ Usability & Control
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("Wi-Fi / Smartphone App",robot.control.wifiSmartphoneApp)}
              {/* {renderBooleanStringTableRow("Scheduling", robot.control.scheduling)} */}
              {/* {renderBooleanStringTableRow("IR/RF Remote Control",robot.control.irRfRemoteControl)} */}
              {renderStringTableRow("Wi-Fi Frequency Band",robot.control.wifiFrequencyBand,"GHz")}
              {renderBooleanStringTableRow("Amazon Alexa Support",robot.control.amazonAlexaSupport)}
              {renderBooleanStringTableRow("Google Assistant Support",robot.control.googleAssistantSupport)}
              {/* {renderBooleanStringTableRow("Display", robot.display)} */}
              {renderBooleanStringTableRow("Voice Prompts", robot.voicePrompts)}
              {renderStringTableRow("Noise Level",robot.noiseLevel,"")}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                  📱 App Features
                </th>
              </tr>
            </thead>
            <tbody>
              {renderBooleanStringTableRow("Real-time tracking",robot.appFeatures.realTimeTracking)}
              {renderBooleanStringTableRow("Digital Blocked Areas",robot.appFeatures.digitalBlockedAreas)}
              {renderBooleanStringTableRow("Zoned cleaning",robot.appFeatures.zonedCleaning)}
              {renderBooleanStringTableRow("Multi-floor maps",robot.appFeatures.multiFloorMaps)}
              {/* {renderBooleanStringTableRow("Manual movement control",robot.appFeatures.manualMovementControl)} */}
              {renderBooleanStringTableRow("Selected Room Cleaning",robot.appFeatures.selectedRoomCleaning)}
              {renderBooleanStringTableRow("No-mop zones",robot.appFeatures.noMopZones)}
            </tbody>
          </table>
          <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
                 Other Specifications
                </th>
              </tr>
            </thead>
            <tbody>
            {renderStringTableRow("Weight",robot.otherSpecifications.weight,"kg")}
            {renderStringTableRow("Width",robot.otherSpecifications.width,"cm")}
            {renderStringTableRow("Height",robot.otherSpecifications.height,"cm")}
            {/* {renderStringTableRow("In the box",robot.otherSpecifications.inTheBox,"")} */}
            <tr>
                <th>Release Date</th>
                <td>
                  <ReleaseDateDisplay
                    releaseDate={robot.otherSpecifications.releaseDate}/>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RobotDetails;
