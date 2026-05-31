package com.robobg.dtos.RobotDTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DockSpecificationsDTO {
    private Long id;
    private String weight;
    private String width;
    private String height;
}
