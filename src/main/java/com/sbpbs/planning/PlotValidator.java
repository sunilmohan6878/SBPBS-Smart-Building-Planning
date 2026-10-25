package com.sbpbs.planning;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PlotValidator {

    public ValidationResult validate(
            BigDecimal plotWidthInches,
            BigDecimal plotDepthInches,
            BigDecimal leftSetbackInches,
            BigDecimal rightSetbackInches,
            BigDecimal frontSetbackInches,
            BigDecimal rearSetbackInches) {

        List<String> errors = new ArrayList<>();

        BigDecimal[] values = {
            plotWidthInches, plotDepthInches,
            leftSetbackInches, rightSetbackInches,
            frontSetbackInches, rearSetbackInches
        };

        String[] names = {
            "Plot width", "Plot depth",
            "Left setback", "Right setback",
            "Front setback", "Rear setback"
        };

        for (int i = 0; i < values.length; i++) {
            if (values[i] == null) {
                errors.add(names[i] + " is required.");
            }
        }

        if (!errors.isEmpty()) {
            return invalid(errors);
        }

        if (plotWidthInches.signum() <= 0) {
            errors.add("Plot width must be greater than zero.");
        }

        if (plotDepthInches.signum() <= 0) {
            errors.add("Plot depth must be greater than zero.");
        }

        BigDecimal[] setbacks = {
            leftSetbackInches, rightSetbackInches,
            frontSetbackInches, rearSetbackInches
        };

        for (int i = 0; i < setbacks.length; i++) {
            if (setbacks[i].signum() < 0) {
                errors.add(names[i + 2] + " cannot be negative.");
            }
        }

        if (!errors.isEmpty()) {
            return invalid(errors);
        }

        BigDecimal buildableWidth = plotWidthInches
                .subtract(leftSetbackInches)
                .subtract(rightSetbackInches);

        BigDecimal buildableDepth = plotDepthInches
                .subtract(frontSetbackInches)
                .subtract(rearSetbackInches);

        if (buildableWidth.signum() <= 0) {
            errors.add(
                "Setbacks leave no positive buildable width."
            );
        }

        if (buildableDepth.signum() <= 0) {
            errors.add(
                "Setbacks leave no positive buildable depth."
            );
        }

        if (!errors.isEmpty()) {
            return invalid(errors);
        }

        BigDecimal area = buildableWidth.multiply(buildableDepth);

        return new ValidationResult(
            true,
            buildableWidth,
            buildableDepth,
            area,
            List.of()
        );
    }

    private ValidationResult invalid(List<String> errors) {
        return new ValidationResult(
            false, null, null, null, List.copyOf(errors)
        );
    }

    public record ValidationResult(
            boolean valid,
            BigDecimal buildableWidthInches,
            BigDecimal buildableDepthInches,
            BigDecimal buildableAreaSquareInches,
            List<String> errors) {
    }
}

