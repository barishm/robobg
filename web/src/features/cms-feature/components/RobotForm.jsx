import { useCreateRobotMutation, useUpdateRobotMutation, useGetRobotByIdQuery } from "src/app/services/robotApiSlice";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { cleanFormValues } from "src/utils/utils";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"

const validationSchema = Yup.object({
    brand: Yup.string()
        .required('Brand is required')
        .min(2, 'Brand must be at least 2 characters'),
    model: Yup.string()
        .required('Model is required')
        .min(2, 'Model must be at least 2 characters'),
});

const RobotForm = ({ action = 'C', id = null }) => {
    const { t } = useTranslation()
    const { accessToken } = useSelector((state) => state.auth);
    const isUpdate = action === 'U' && id;

    const [createRobot, { isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] = useCreateRobotMutation();
    const [updateRobot, { isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useUpdateRobotMutation();
    const [purchaseLinks, setPurchaseLinks] = useState([]);
    const { data, isLoading: isLoadingRobot, isFetching } = useGetRobotByIdQuery({ id }, { skip: !isUpdate });
    const [robotData, setRobotData] = useState();

    const addLinkField = () => {
        setPurchaseLinks(prev => [...prev, { name: "", link: "" }]);
    };

    const removeLinkField = () => {
        setPurchaseLinks(prev => prev.slice(0, -1));
    };

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...purchaseLinks];
        updatedLinks[index][field] = value;
        setPurchaseLinks(updatedLinks);
    };

    useEffect(() => {
        if (isUpdate) {
            setRobotData(data || undefined);
            setPurchaseLinks(data?.purchaseLinks || []);
        }
    }, [data, isUpdate]);

    useEffect(() => {
        if (isCreateSuccess) {
            toast.success("Robot created successfully!");
        } else if (isCreateError) {
            toast.error(`Failed to create robot: ${createError?.data?.error || createError?.error || "Unknown error"}`);
        }
    }, [isCreateSuccess, isCreateError, createError]);

    useEffect(() => {
        if (isUpdateSuccess) {
            toast.success("Robot updated successfully!");
        } else if (isUpdateError) {
            toast.error(`Failed to update robot: ${updateError?.data?.error || updateError?.error || "Unknown error"}`);
        }
    }, [isUpdateSuccess, isUpdateError, updateError]);

    const getInitialValues = () => {
        if (isUpdate && robotData) {
            return {
                id: id,
                brand: robotData?.brand || "",
                model: robotData?.model || "",
                bests: robotData?.bests ?? "null",
                mapping: robotData?.mapping ?? "null",
                mappingSensorType: robotData?.mappingSensorType || "",
                highPrecisionMap: robotData?.highPrecisionMap ?? "null",
                frontCamera: robotData?.frontCamera ?? "null",
                rechargeResume: robotData?.rechargeResume ?? "null",
                autoDockAndRecharge: robotData?.autoDockAndRecharge ?? "null",
                noiseLevel: robotData?.noiseLevel || "",
                display: robotData?.display ?? "null",
                sideBrushes: robotData?.sideBrushes || "",
                voicePrompts: robotData?.voicePrompts ?? "null",
                cleaningFeatures: {
                    suctionPower: robotData?.cleaningFeatures?.suctionPower || "",
                    cleaningArea: robotData?.cleaningFeatures?.cleaningArea || "",
                    dustbinCapacity: robotData?.cleaningFeatures?.dustbinCapacity || "",
                    disposableDustBagCapacity: robotData?.cleaningFeatures?.disposableDustBagCapacity || "",
                    autoDirtDisposal: robotData?.cleaningFeatures?.autoDirtDisposal ?? "null",
                    barrierCrossHeight: robotData?.cleaningFeatures?.barrierCrossHeight || "",
                    hepaFilter: robotData?.cleaningFeatures?.hepaFilter ?? "null",
                    washableFilter: robotData?.cleaningFeatures?.washableFilter ?? "null"
                },
                moppingFeatures: {
                    wetMopping: robotData?.moppingFeatures?.wetMopping ?? "null",
                    electricWaterFlowControl: robotData?.moppingFeatures?.electricWaterFlowControl ?? "null",
                    waterTankCapacity: robotData?.moppingFeatures?.waterTankCapacity || "",
                    vibratingMoppingPad: robotData?.moppingFeatures?.vibratingMoppingPad ?? "null",
                    autoMopLifting: robotData?.moppingFeatures?.autoMopLifting ?? "null",
                    autoWaterTankRefilling: robotData?.moppingFeatures?.autoWaterTankRefilling ?? "null",
                    autoMopWashing: robotData?.moppingFeatures?.autoMopWashing ?? "null",
                    spinningMops: robotData?.moppingFeatures?.spinningMops ?? "null",
                    washingMopsWithWarmWater: robotData?.moppingFeatures?.washingMopsWithWarmWater ?? "null",
                    dryingTheMops: robotData?.moppingFeatures?.dryingTheMops ?? "null",
                    automaticDetergentDosing: robotData?.moppingFeatures?.automaticDetergentDosing ?? "null",
                },
                battery: {
                    batteryCapacity: robotData?.battery?.batteryCapacity || "",
                    batteryLife: robotData?.battery?.batteryLife || "",
                    chargingTime: robotData?.battery?.chargingTime || "",
                    ratedPower: robotData?.battery?.ratedPower || ""
                },
                control: {
                    scheduling: robotData?.control?.scheduling ?? "null",
                    wifiSmartphoneApp: robotData?.control?.wifiSmartphoneApp ?? "null",
                    wifiFrequencyBand: robotData?.control?.wifiFrequencyBand || "",
                    amazonAlexaSupport: robotData?.control?.amazonAlexaSupport ?? "null",
                    googleAssistantSupport: robotData?.control?.googleAssistantSupport ?? "null",
                    magneticVirtualWalls: robotData?.control?.magneticVirtualWalls ?? "null",
                    irRfRemoteControl: robotData?.control?.irRfRemoteControl ?? "null"
                },
                appFeatures: {
                    realTimeTracking: robotData?.appFeatures?.realTimeTracking ?? "null",
                    digitalBlockedAreas: robotData?.appFeatures?.digitalBlockedAreas ?? "null",
                    zonedCleaning: robotData?.appFeatures?.zonedCleaning ?? "null",
                    multiFloorMaps: robotData?.appFeatures?.multiFloorMaps ?? "null",
                    manualMovementControl: robotData?.appFeatures?.manualMovementControl ?? "null",
                    selectedRoomCleaning: robotData?.appFeatures?.selectedRoomCleaning ?? "null",
                    noMopZones: robotData?.appFeatures?.noMopZones ?? "null"
                },
                sensor: {
                    carpetBoost: robotData?.sensor?.carpetBoost ?? "null",
                    cliffSensor: robotData?.sensor?.cliffSensor ?? "null",
                    dirtSensor: robotData?.sensor?.dirtSensor ?? "null",
                    fullDustbinSensor: robotData?.sensor?.fullDustbinSensor ?? "null"
                },
                otherSpecifications: {
                    weight: robotData?.otherSpecifications?.weight || "",
                    width: robotData?.otherSpecifications?.width || "",
                    height: robotData?.otherSpecifications?.height || "",
                    inTheBox: robotData?.otherSpecifications?.inTheBox || "",
                    releaseDate: robotData?.otherSpecifications?.releaseDate || "",
                    warranty: robotData?.otherSpecifications?.warranty || ""
                },
                dockSpecifications: {
                    weight: robotData?.dockSpecifications?.weight || "",
                    width: robotData?.dockSpecifications?.width || "",
                    height: robotData?.dockSpecifications?.height || ""
                }
            };
        }
        // Default create values
        return {
            brand: "",
            model: "",
            bests: "null",
            mapping: "null",
            mappingSensorType: "",
            highPrecisionMap: "null",
            frontCamera: "null",
            rechargeResume: "null",
            autoDockAndRecharge: "null",
            noiseLevel: "",
            display: "null",
            sideBrushes: "",
            voicePrompts: "null",
            cleaningFeatures: {
                suctionPower: "",
                cleaningArea: "",
                dustbinCapacity: "",
                disposableDustBagCapacity: "",
                autoDirtDisposal: "null",
                barrierCrossHeight: "",
                hepaFilter: "null",
                washableFilter: "null"
            },
            moppingFeatures: {
                wetMopping: "null",
                electricWaterFlowControl: "null",
                waterTankCapacity: "",
                vibratingMoppingPad: "null",
                autoMopLifting: "null",
                autoWaterTankRefilling: "null",
                autoMopWashing: "null",
                spinningMops: "null",
                washingMopsWithWarmWater: "null",
                dryingTheMops: "null",
                automaticDetergentDosing: "null"
            },
            battery: {
                batteryCapacity: "",
                batteryLife: "",
                chargingTime: "",
                ratedPower: ""
            },
            control: {
                scheduling: "null",
                wifiSmartphoneApp: "null",
                wifiFrequencyBand: "",
                amazonAlexaSupport: "null",
                googleAssistantSupport: "null",
                magneticVirtualWalls: "null",
                irRfRemoteControl: "null"
            },
            appFeatures: {
                realTimeTracking: "null",
                digitalBlockedAreas: "null",
                zonedCleaning: "null",
                multiFloorMaps: "null",
                manualMovementControl: "null",
                selectedRoomCleaning: "null",
                noMopZones: "null"
            },
            sensor: {
                carpetBoost: "null",
                cliffSensor: "null",
                dirtSensor: "null",
                fullDustbinSensor: "null"
            },
            otherSpecifications: {
                weight: "",
                width: "",
                height: "",
                inTheBox: "",
                releaseDate: "",
                warranty: ""
            },
            dockSpecifications: {
                weight: "",
                width: "",
                height: ""
            }
        };
    };

    const handleSubmit = async (robotBody) => {
        try {
            if (isUpdate) {
                await updateRobot({ robotBody, accessToken }).unwrap();
            } else {
                await createRobot({ robotBody, accessToken }).unwrap();
            }
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    const formik = useFormik({
        enableReinitialize: isUpdate,
        initialValues: getInitialValues(),
        validationSchema: validationSchema,
        onSubmit: values => {
            const robotBody = cleanFormValues(values);
            robotBody.purchaseLinks = purchaseLinks;
            handleSubmit(robotBody);
        },
    });

    // Always use "update" modal ID when action is 'U', even if id is null initially
    const modalId = action === 'U' ? t("update") : t("create");
    const modalTitle = action === 'U' ? t("Edit Robot") : t("Create Robot");
    const submitButtonText = action === 'U' ? t("Edit") : t("Create");
    const submitButtonClass = action === 'U' ? "btn btn-primary" : "btn btn-success";

    // Show loading state in update mode when data is not yet loaded
    // Only show loading if we have an id and are actually fetching, or if we have an id but no data yet
    const showLoading = action === 'U' && id && (isLoadingRobot || isFetching || !robotData);

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="Y"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">
                                {modalTitle}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {showLoading ? (
                                <div className="d-flex justify-content-center mt-4 mb-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-inputs">
                                    <div className="mb-3">
                                        <label htmlFor="brand" className="form-label">Brand</label>
                                        <input
                                            className={`form-control form-control-sm ${formik.touched.brand && formik.errors.brand ? 'is-invalid' : ''}`}
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.brand || ""}
                                        />
                                        {formik.touched.brand && formik.errors.brand && (
                                            <div className="invalid-feedback d-block">
                                                {formik.errors.brand}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="model" className="form-label">Model</label>
                                        <input
                                            className={`form-control form-control-sm ${formik.touched.model && formik.errors.model ? 'is-invalid' : ''}`}
                                            type="text"
                                            id="model"
                                            name="model"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.model || ""}
                                        />
                                        {formik.touched.model && formik.errors.model && (
                                            <div className="invalid-feedback d-block">
                                                {formik.errors.model}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">One of bests</label>
                                        <input className="form-control form-control-sm" type="number" name="bests" onChange={formik.handleChange} value={formik.values.bests}></input>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Mapping</label>
                                        <select className="form-control form-control-sm" name="mapping" onChange={formik.handleChange} value={formik.values.mapping ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Mapping Sensor Type</label>
                                        <input className="form-control form-control-sm" type="text" name="mappingSensorType" onChange={formik.handleChange} value={formik.values.mappingSensorType || ""} aria-label=".form-control-sm example" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">High Precision Map</label>
                                        <select className="form-control form-control-sm" name="highPrecisionMap" onChange={formik.handleChange} value={formik.values.highPrecisionMap ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="frontCamera" className="form-label">Front Camera</label>
                                        <select className="form-control form-control-sm" name="frontCamera" onChange={formik.handleChange} value={formik.values.frontCamera ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="rechargeResume" className="form-label">Recharge Resume</label>
                                        <select className="form-control form-control-sm" name="rechargeResume" onChange={formik.handleChange} value={formik.values.rechargeResume ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="autoDockAndRecharge" className="form-label">Auto Dock And Recharge</label>
                                        <select className="form-control form-control-sm" name="autoDockAndRecharge" onChange={formik.handleChange} value={formik.values.autoDockAndRecharge ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="display" className="form-label">Display</label>
                                            <select className="form-control form-control-sm" name="display" onChange={formik.handleChange} value={formik.values.display ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Noise Level</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="noiseLevel" onChange={formik.handleChange} value={formik.values.noiseLevel || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">dB</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Side Brushes</label>
                                        <input className="form-control form-control-sm" type="text" name="sideBrushes" onChange={formik.handleChange} value={formik.values.sideBrushes || ""} aria-label=".form-control-sm example" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Voice Prompts</label>
                                        <select className="form-control form-control-sm" name="voicePrompts" onChange={formik.handleChange} value={formik.values.voicePrompts ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <h5 className="text-center mt-4">Cleaning features</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Suction Power</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type={isUpdate ? "text" : "number"} name="cleaningFeatures.suctionPower" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.suctionPower || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">Pa</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Cleaning Area</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="cleaningFeatures.cleaningArea" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.cleaningArea || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">m&sup2;</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Dustbin Capacity</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type={isUpdate ? "text" : "number"} name="cleaningFeatures.dustbinCapacity" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.dustbinCapacity || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">ml</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Disposable Dust Bag Capacity</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="cleaningFeatures.disposableDustBagCapacity" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.disposableDustBagCapacity || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">L</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Auto Dirt Disposal</label>
                                        <select className="form-control form-control-sm" name="cleaningFeatures.autoDirtDisposal" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.autoDirtDisposal ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Barrier Cross Height</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="cleaningFeatures.barrierCrossHeight" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.barrierCrossHeight || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">mm</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Hepa Filter</label>
                                        <select className="form-control form-control-sm" name="cleaningFeatures.hepaFilter" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.hepaFilter ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Washable Filter</label>
                                        <select className="form-control form-control-sm" name="cleaningFeatures.washableFilter" onChange={formik.handleChange} value={formik.values.cleaningFeatures?.washableFilter ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <h5 className="text-center mt-4">Mopping features</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Wet Mopping</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.wetMopping" onChange={formik.handleChange} value={formik.values.moppingFeatures?.wetMopping ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Electric Water Flow Control</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.electricWaterFlowControl" onChange={formik.handleChange} value={formik.values.moppingFeatures?.electricWaterFlowControl ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Water Tank Capacity</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="moppingFeatures.waterTankCapacity" onChange={formik.handleChange} value={formik.values.moppingFeatures?.waterTankCapacity || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">ml</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Vibrating Mopping Pad</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.vibratingMoppingPad" onChange={formik.handleChange} value={formik.values.moppingFeatures?.vibratingMoppingPad ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Auto Mop Lifting</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.autoMopLifting" onChange={formik.handleChange} value={formik.values.moppingFeatures?.autoMopLifting ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Auto Water Tank Refilling</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.autoWaterTankRefilling" onChange={formik.handleChange} value={formik.values.moppingFeatures?.autoWaterTankRefilling ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Spinning mops</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.spinningMops" onChange={formik.handleChange} value={formik.values.moppingFeatures?.spinningMops ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Washing Mops With Warm Water</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.washingMopsWithWarmWater" onChange={formik.handleChange} value={formik.values.moppingFeatures?.washingMopsWithWarmWater ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Drying The Mops</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.dryingTheMops" onChange={formik.handleChange} value={formik.values.moppingFeatures?.dryingTheMops ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Automatic Detergent Dosing</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.automaticDetergentDosing" onChange={formik.handleChange} value={formik.values.moppingFeatures?.automaticDetergentDosing ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Auto Mop Washing</label>
                                        <select className="form-control form-control-sm" name="moppingFeatures.autoMopWashing" onChange={formik.handleChange} value={formik.values.moppingFeatures?.autoMopWashing ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <h5 className="text-center mt-4">Battery</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Battery Capacity</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="battery.batteryCapacity" onChange={formik.handleChange} value={formik.values.battery?.batteryCapacity || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">mAh</span>
                                        </div>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Battery Life</label>
                                            <div className="input-group">
                                                <input className="form-control form-control-sm" type="text" name="battery.batteryLife" onChange={formik.handleChange} value={formik.values.battery?.batteryLife || ""} aria-label=".form-control-sm example" />
                                                <span className="input-group-text">min</span>
                                            </div>
                                        </div> */}
                                    {/* <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Charging Time</label>
                                            <div className="input-group">
                                                <input className="form-control form-control-sm" type="text" name="battery.chargingTime" onChange={formik.handleChange} value={formik.values.battery?.chargingTime || ""} aria-label=".form-control-sm example" />
                                                <span className="input-group-text">min</span>
                                            </div>
                                        </div> */}
                                    {/* <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Rated Power</label>
                                            <div className="input-group">
                                                <input className="form-control form-control-sm" type="text" name="battery.ratedPower" onChange={formik.handleChange} value={formik.values.battery?.ratedPower || ""} aria-label=".form-control-sm example" />
                                                <span className="input-group-text">W</span>
                                            </div>
                                        </div> */}
                                    {/* <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Scheduling</label>
                                            <select className="form-control form-control-sm" name="control.scheduling" onChange={formik.handleChange} value={formik.values.control?.scheduling ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    <h5 className="text-center mt-4">Control</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Wifi Smartphone App</label>
                                        <select className="form-control form-control-sm" name="control.wifiSmartphoneApp" onChange={formik.handleChange} value={formik.values.control?.wifiSmartphoneApp ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Wifi Frequency Band</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="control.wifiFrequencyBand" onChange={formik.handleChange} value={formik.values.control?.wifiFrequencyBand || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">GHz</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Amazon Alexa Support</label>
                                        <select className="form-control form-control-sm" name="control.amazonAlexaSupport" onChange={formik.handleChange} value={formik.values.control?.amazonAlexaSupport ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Google Assistant Support</label>
                                        <select className="form-control form-control-sm" name="control.googleAssistantSupport" onChange={formik.handleChange} value={formik.values.control?.googleAssistantSupport ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Virtual Walls</label>
                                        <select className="form-control form-control-sm" name="control.magneticVirtualWalls" onChange={formik.handleChange} value={formik.values.control?.magneticVirtualWalls ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="irRfRemoteControl" className="form-label">IR/RF Remote Control</label>
                                            <select className="form-control form-control-sm" name="control.irRfRemoteControl" onChange={formik.handleChange} value={formik.values.control?.irRfRemoteControl ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    <h5 className="text-center mt-4">App features</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Real Time Tracking</label>
                                        <select className="form-control form-control-sm" name="appFeatures.realTimeTracking" onChange={formik.handleChange} value={formik.values.appFeatures?.realTimeTracking ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Digital Blocked Areas</label>
                                        <select className="form-control form-control-sm" name="appFeatures.digitalBlockedAreas" onChange={formik.handleChange} value={formik.values.appFeatures?.digitalBlockedAreas ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Zoned Cleaning</label>
                                        <select className="form-control form-control-sm" name="appFeatures.zonedCleaning" onChange={formik.handleChange} value={formik.values.appFeatures?.zonedCleaning ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Multi Floor Maps</label>
                                        <select className="form-control form-control-sm" name="appFeatures.multiFloorMaps" onChange={formik.handleChange} value={formik.values.appFeatures?.multiFloorMaps ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="manualMovementControl" className="form-label">Manual Movement Control</label>
                                            <select className="form-control form-control-sm" name="appFeatures.manualMovementControl" onChange={formik.handleChange} value={formik.values.appFeatures?.manualMovementControl ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Selected Room Cleaning</label>
                                        <select className="form-control form-control-sm" name="appFeatures.selectedRoomCleaning" onChange={formik.handleChange} value={formik.values.appFeatures?.selectedRoomCleaning ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">No Mop Zones</label>
                                        <select className="form-control form-control-sm" name="appFeatures.noMopZones" onChange={formik.handleChange} value={formik.values.appFeatures?.noMopZones ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <h5 className="text-center mt-4">Sensor</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Carpet Boost</label>
                                        <select className="form-control form-control-sm" name="sensor.carpetBoost" onChange={formik.handleChange} value={formik.values.sensor?.carpetBoost ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Cliff Sensor</label>
                                        <select className="form-control form-control-sm" name="sensor.cliffSensor" onChange={formik.handleChange} value={formik.values.sensor?.cliffSensor ?? "null"}>
                                            <option value="null">N/A</option>
                                            <option value="Y">YES</option>
                                            <option value="N">NO</option>
                                        </select>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="dirtSensor" className="form-label">Dirt Sensor</label>
                                            <select className="form-control form-control-sm" name="sensor.dirtSensor" onChange={formik.handleChange} value={formik.values.sensor?.dirtSensor ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    {/* <div className="mb-3">
                                            <label htmlFor="fullDustbinSensor" className="form-label">Full Dustbin Sensor</label>
                                            <select className="form-control form-control-sm" name="sensor.fullDustbinSensor" onChange={formik.handleChange} value={formik.values.sensor?.fullDustbinSensor ?? "null"}>
                                                <option value="null">N/A</option>
                                                <option value="Y">YES</option>
                                                <option value="N">NO</option>
                                            </select>
                                        </div> */}
                                    <h5 className="text-center mt-4">Other specifications</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Weight</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="otherSpecifications.weight" onChange={formik.handleChange} value={formik.values.otherSpecifications?.weight || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">kg</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Width</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="otherSpecifications.width" onChange={formik.handleChange} value={formik.values.otherSpecifications?.width || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">cm</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Height</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="otherSpecifications.height" onChange={formik.handleChange} value={formik.values.otherSpecifications?.height || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">cm</span>
                                        </div>
                                    </div>
                                    {/* <div className="mb-3">
                                            <label htmlFor="inTheBox" className="form-label">In The Box</label>
                                            <textarea
                                                className="form-control form-control-sm"
                                                name="otherSpecifications.inTheBox"
                                                onChange={formik.handleChange}
                                                value={formik.values.otherSpecifications?.inTheBox || ""}
                                                rows="3"
                                                placeholder="Enter items included in the box"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="warranty" className="form-label">Warranty</label>
                                            <input
                                                className="form-control form-control-sm"
                                                type="text"
                                                name="otherSpecifications.warranty"
                                                onChange={formik.handleChange}
                                                value={formik.values.otherSpecifications?.warranty || ""}
                                                placeholder="e.g., 2 years"
                                            />
                                        </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Release Date</label>
                                        <input className="form-control form-control-sm" type="date" name="otherSpecifications.releaseDate" onChange={formik.handleChange} value={formik.values.otherSpecifications?.releaseDate || ""} aria-label=".form-control-sm example" />
                                    </div>
                                    <h5 className="text-center mt-4">Dock specifications</h5>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Weight</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="dockSpecifications.weight" onChange={formik.handleChange} value={formik.values.dockSpecifications?.weight || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">kg</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Width</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="dockSpecifications.width" onChange={formik.handleChange} value={formik.values.dockSpecifications?.width || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">cm</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Height</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm" type="text" name="dockSpecifications.height" onChange={formik.handleChange} value={formik.values.dockSpecifications?.height || ""} aria-label=".form-control-sm example" />
                                            <span className="input-group-text">cm</span>
                                        </div>
                                    </div>
                                    {purchaseLinks.length > 0 && (
                                        <>
                                            <h5 className="text-center mt-4">Purchase links</h5>
                                            <hr />

                                            <div className="mb-3">
                                                {purchaseLinks.map((link, index) => (
                                                    <div key={index}>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Link name #{index + 1}
                                                            </label>
                                                            <input
                                                                className="form-control form-control-sm"
                                                                type="text"
                                                                value={link.name}
                                                                onChange={(e) =>
                                                                    handleLinkChange(index, "name", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Link url #{index + 1}
                                                            </label>
                                                            <input
                                                                className="form-control form-control-sm"
                                                                type="text"
                                                                value={link.link}
                                                                onChange={(e) =>
                                                                    handleLinkChange(index, "link", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => { formik.resetForm() }}
                            >
                                {t("close")}
                            </button>
                            <button type="button" className="btn btn-danger me-1" onClick={removeLinkField}><b>-</b></button>
                            <button type="button" className="btn btn-success" onClick={addLinkField}><b>+</b></button>
                            <button type="submit" className={submitButtonClass} data-bs-dismiss="modal">
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RobotForm;

