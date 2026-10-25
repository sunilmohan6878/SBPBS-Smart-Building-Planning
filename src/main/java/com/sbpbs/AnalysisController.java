package com.sbpbs;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import com.sbpbs.planning.PlotValidator;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
public class AnalysisController {
    private static final double SQFT_PER_SQM = 10.7639;
private final PlotValidator plotValidator = new PlotValidator();
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "application", "SBPBS",
                "storage", "MySQL via Spring Data JPA");
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, Object> input) {
        double length = positive(input, "length");
        double width = positive(input, "width");
        String unit = text(input, "unit", "ft");
        if (!unit.equalsIgnoreCase("ft") && !unit.equalsIgnoreCase("m")) {
            throw badRequest("unit must be 'ft' or 'm'.");
        }

        double factor = unit.equalsIgnoreCase("m") ? SQFT_PER_SQM : 1.0;
        double plotArea = length * width * factor;
        if (!Double.isFinite(plotArea) || plotArea <= 0 || plotArea > 1_000_000_000) {
            throw badRequest("Plot area is outside the supported range.");
        }

        double coverage = 0.75; // configurable academic assumption, not a legal allowance
        double buildable = plotArea * coverage;
        int floors = integerInRange(input, "floors", 1, 10, 1);
        String style = text(input, "style", "Modern");
        double rate = switch (style.toLowerCase(Locale.ROOT)) {
            case "traditional" -> 1900;
            case "minimal" -> 1700;
            case "eco", "eco friendly", "eco-friendly" -> 2400;
            default -> 2200;
        };
        double totalBuiltArea = buildable * floors;
        double estimatedCost = totalBuiltArea * rate;

        List<String> recommendations = new ArrayList<>();
        String slope = text(input, "slope", "");
        String soil = text(input, "soil", "");
        String road = text(input, "road", "");
        String water = text(input, "water", "");
        if (slope.equalsIgnoreCase("Steep")) recommendations.add("Obtain a professional slope, drainage and foundation assessment.");
        if (soil.equalsIgnoreCase("Clay")) recommendations.add("Request a geotechnical soil investigation before selecting foundations.");
        if (soil.equalsIgnoreCase("Sandy")) recommendations.add("Have soil bearing capacity and settlement risk assessed by a qualified geotechnical professional.");
        if (road.equalsIgnoreCase("Limited") || road.equalsIgnoreCase("None")) recommendations.add("Verify construction access and emergency vehicle access before planning.");
        if (water.equalsIgnoreCase("None")) recommendations.add("Plan and verify a suitable water supply and storage strategy.");
        if (Boolean.TRUE.equals(input.get("solar"))) recommendations.add("Evaluate roof orientation, shading and local rules for a solar installation.");
        if (Boolean.TRUE.equals(input.get("rainwater"))) recommendations.add("Assess rainwater harvesting feasibility and local requirements.");
        if (floors >= 3) recommendations.add("Multi-floor planning requires professional structural and vertical-circulation design.");
        recommendations.add("Verify local setbacks, ground coverage, floor-area ratio, height limits and permits.");
        recommendations.add("Cost rates and 75% ground coverage are prototype assumptions, not quotations or legal approvals.");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("plotAreaSqFt", round(plotArea));
        result.put("assumedCoverage", coverage);
        result.put("assumedBuildableAreaSqFt", round(buildable));
        result.put("openAreaSqFt", round(plotArea - buildable));
        result.put("floors", floors);
        result.put("totalBuiltAreaSqFt", round(totalBuiltArea));
        result.put("costRatePerSqFt", rate);
        result.put("estimatedCostINR", round(estimatedCost));
        result.put("style", style);
        result.put("recommendations", recommendations);
        result.put("disclaimer", "Preliminary academic estimate only. This is not a structural design, survey, legal approval or construction-ready blueprint. Consult licensed professionals before construction.");
        return result;
    }

    @PostMapping("/blueprint")
    public Map<String, Object> blueprint(@RequestBody Map<String, Object> input) {
        double plotLength = positive(input, "length");
        double plotWidth = positive(input, "width");
        String unit = text(input, "unit", "ft");
        if (!unit.equalsIgnoreCase("ft") && !unit.equalsIgnoreCase("m")) {
            throw badRequest("unit must be 'ft' or 'm'.");
        }
        
double unitToFeet = unit.equalsIgnoreCase("m") ? 3.28084 : 1.0;

plotLength *= unitToFeet;
plotWidth *= unitToFeet;

// Missing setbacks default to zero for backward compatibility.
double leftSetbackFt = optionalNonNegative(input, "leftSetback") * unitToFeet;
double rightSetbackFt = optionalNonNegative(input, "rightSetback") * unitToFeet;
double frontSetbackFt = optionalNonNegative(input, "frontSetback") * unitToFeet;
double rearSetbackFt = optionalNonNegative(input, "rearSetback") * unitToFeet;

PlotValidator.ValidationResult validation = plotValidator.validate(
        BigDecimal.valueOf(plotWidth * 12.0),
        BigDecimal.valueOf(plotLength * 12.0),
        BigDecimal.valueOf(leftSetbackFt * 12.0),
        BigDecimal.valueOf(rightSetbackFt * 12.0),
        BigDecimal.valueOf(frontSetbackFt * 12.0),
        BigDecimal.valueOf(rearSetbackFt * 12.0)
);

if (!validation.valid()) {
    throw badRequest(String.join(" ", validation.errors()));
}

double buildingWidth = validation.buildableWidthInches().doubleValue() / 12.0;
double buildingLength = validation.buildableDepthInches().doubleValue() / 12.0;


        int beds = integerInRange(input, "beds", 0, 12, 2);
        int baths = integerInRange(input, "baths", 0, 8, 1);
        int floors = integerInRange(input, "floors", 1, 10, 1);
        List<RoomSpec> specs = new ArrayList<>();
        specs.add(new RoomSpec("Living", "living", 1.8, 100));
        specs.add(new RoomSpec("Kitchen", "kitchen", 1.1, 55));
        for (int i = 1; i <= beds; i++) specs.add(new RoomSpec("Bedroom " + i, "bedroom", 1.2, 70));
        for (int i = 1; i <= baths; i++) specs.add(new RoomSpec("Bathroom " + i, "bathroom", 0.55, 25));
        if ("Required".equalsIgnoreCase(text(input, "parking", ""))) {
            specs.add(new RoomSpec("Parking", "parking", 1.5, 90));
        }

        // Prototype assumption only: preserve the plot aspect ratio while reserving 25% as open area.
        List<Map<String, Object>> rooms = new ArrayList<>();
partitionRooms(specs, 0, specs.size(), 0, 0, 1, 1,
        buildingWidth, buildingLength, rooms);

        List<String> warnings = new ArrayList<>();
        for (Map<String, Object> room : rooms) {
            double roomW = ((Number) room.get("widthFt")).doubleValue();
            double roomH = ((Number) room.get("heightFt")).doubleValue();
            String name = String.valueOf(room.get("name"));
            if (roomW < 5 || roomH < 5) {
                warnings.add(name + " is smaller than the prototype's 5 ft minimum dimension; revise the requirements or layout.");
            }
            if (((Number) room.get("areaSqFt")).doubleValue() < ((Number) room.get("targetAreaSqFt")).doubleValue()) {
                warnings.add(name + " is below its prototype target area; review the layout with a qualified designer.");
            }
        }
        if (floors > 1) warnings.add("This preview describes one typical floor only; upper floors, stairs, structure and service alignment need separate planning.");
        warnings.add("The 75% footprint is an illustrative assumption, not a verified local setback or coverage allowance.");
        warnings.add("Doors, windows, accessibility, ventilation, structure and local building rules are not fully validated by this prototype.");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("plotLengthFt", round(plotLength));
        result.put("plotWidthFt", round(plotWidth));
        result.put("plotAreaSqFt", round(plotLength * plotWidth));
        
result.put("buildingLengthFt", round(buildingLength));
result.put("buildingWidthFt", round(buildingWidth));
result.put("buildingFootprintSqFt", round(buildingLength * buildingWidth));

result.put("leftSetbackFt", round(leftSetbackFt));
result.put("rightSetbackFt", round(rightSetbackFt));
result.put("frontSetbackFt", round(frontSetbackFt));
result.put("rearSetbackFt", round(rearSetbackFt));

result.put("buildableWidthFt", round(buildingWidth));
result.put("buildableDepthFt", round(buildingLength));
result.put("buildableAreaSqFt", round(buildingWidth * buildingLength));

result.put("setbacksSpecified",
        input.containsKey("leftSetback")
        || input.containsKey("rightSetback")
        || input.containsKey("frontSetback")
        || input.containsKey("rearSetback"));

result.put("remainingPlotAreaOutsideFootprintSqFt",
        round((plotLength * plotWidth) - (buildingLength * buildingWidth)));

        result.put("floorsRequested", floors);
        result.put("layoutType", "weighted-partition-concept");
        result.put("rooms", rooms);
        result.put("warnings", warnings);
        result.put("disclaimer", "Advanced preliminary concept only. Room partitions and target areas are algorithmic suggestions, not a construction-ready design. Obtain site-specific review from qualified architectural and structural professionals.");
        return result;
    }

    private void partitionRooms(List<RoomSpec> specs, int from, int to,
                                double x, double y, double w, double h,
                                double buildingLengthFt, double buildingWidthFt,
                                List<Map<String, Object>> output) {
        if (to <= from) return;
        if (to - from == 1) {
            RoomSpec spec = specs.get(from);
            double widthFt = w * buildingLengthFt;
            double heightFt = h * buildingWidthFt;
            Map<String, Object> room = new LinkedHashMap<>();
            room.put("name", spec.name);
            room.put("type", spec.type);
            room.put("x", round4(x));
            room.put("y", round4(y));
            room.put("width", round4(w));
            room.put("height", round4(h));
            room.put("widthFt", round(widthFt));
            room.put("heightFt", round(heightFt));
            room.put("areaSqFt", round(widthFt * heightFt));
            room.put("targetAreaSqFt", spec.targetAreaSqFt);
            output.add(room);
            return;
        }

        double totalWeight = 0;
        for (int i = from; i < to; i++) totalWeight += specs.get(i).weight;
        double halfWeight = totalWeight / 2.0;
        double cumulative = 0;
        int split = from + 1;
        double bestDifference = Double.MAX_VALUE;
        for (int i = from + 1; i < to; i++) {
            cumulative += specs.get(i - 1).weight;
            double difference = Math.abs(halfWeight - cumulative);
            if (difference < bestDifference) {
                bestDifference = difference;
                split = i;
            }
        }

        // Split along the longer physical dimension to reduce extreme room proportions.
        boolean splitAlongLength = (w * buildingLengthFt) >= (h * buildingWidthFt);
        double firstWeight = 0;
        for (int i = from; i < split; i++) firstWeight += specs.get(i).weight;
        double fraction = Math.max(0.25, Math.min(0.75, firstWeight / totalWeight));
        if (splitAlongLength) {
            double firstW = w * fraction;
            partitionRooms(specs, from, split, x, y, firstW, h, buildingLengthFt, buildingWidthFt, output);
            partitionRooms(specs, split, to, x + firstW, y, w - firstW, h, buildingLengthFt, buildingWidthFt, output);
        } else {
            double firstH = h * fraction;
            partitionRooms(specs, from, split, x, y, w, firstH, buildingLengthFt, buildingWidthFt, output);
            partitionRooms(specs, split, to, x, y + firstH, w, h - firstH, buildingLengthFt, buildingWidthFt, output);
        }
    }

    private static final class RoomSpec {
        private final String name;
        private final String type;
        private final double weight;
        private final double targetAreaSqFt;
        private RoomSpec(String name, String type, double weight, double targetAreaSqFt) {
            this.name = name;
            this.type = type;
            this.weight = weight;
            this.targetAreaSqFt = targetAreaSqFt;
        }
    }

private double optionalNonNegative(Map<String, Object> input, String key) {
    Object raw = input.get(key);

    if (raw == null || String.valueOf(raw).trim().isEmpty()) {
        return 0.0;
    }

    final double value;
    try {
        value = Double.parseDouble(String.valueOf(raw).trim());
    } catch (NumberFormatException ex) {
        throw badRequest(key + " must be a non-negative number.");
    }

    if (!Double.isFinite(value) || value < 0 || value > 1_000_000) {
        throw badRequest(key + " must be between 0 and 1000000.");
    }

    return value;
}

    private double positive(Map<String, Object> input, String key) {
        Object raw = input.get(key);
        double value;
        try { value = Double.parseDouble(String.valueOf(raw)); }
        catch (Exception ex) { throw badRequest(key + " must be a number greater than zero."); }
        if (!Double.isFinite(value) || value <= 0 || value > 1_000_000) {
            throw badRequest(key + " must be greater than zero and within the supported range.");
        }
        return value;
    }

    private int integerInRange(Map<String, Object> input, String key, int min, int max, int fallback) {
        Object raw = input.get(key);
        if (raw == null) return fallback;
        try {
            double number = Double.parseDouble(String.valueOf(raw));
            int value = (int) number;
            if (!Double.isFinite(number) || number != value || value < min || value > max)
                throw badRequest(key + " must be an integer between " + min + " and " + max + ".");
            return value;
        } catch (NumberFormatException ex) {
            throw badRequest(key + " must be an integer between " + min + " and " + max + ".");
        }
    }

    private String text(Map<String, Object> input, String key, String fallback) {
        Object value = input.get(key);
        return value == null ? fallback : String.valueOf(value).trim();
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private double round(double value) { return Math.round(value * 100.0) / 100.0; }
    private double round4(double value) { return Math.round(value * 10000.0) / 10000.0; }
}
