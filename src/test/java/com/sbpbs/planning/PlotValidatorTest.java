
package com.sbpbs.planning;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PlotValidatorTest {

    private final PlotValidator validator = new PlotValidator();

    private BigDecimal inches(String value) {
        return new BigDecimal(value);
    }

    @Test
    void calculatesBuildableEnvelopeCorrectly() {
        var result = validator.validate(
            inches("480"), inches("720"),
            inches("36"), inches("36"),
            inches("60"), inches("60")
        );

        assertTrue(result.valid(), result.errors().toString());
        assertEquals(inches("408"), result.buildableWidthInches());
        assertEquals(inches("600"), result.buildableDepthInches());
        assertEquals(inches("244800"), result.buildableAreaSquareInches());
    }

    @Test
    void acceptsFractionalInchDimensions() {
        var result = validator.validate(
            inches("480.5"), inches("720.25"),
            inches("36.25"), inches("36.25"),
            inches("60.125"), inches("60.125")
        );

        assertTrue(result.valid(), result.errors().toString());
        assertEquals(
            0, result.buildableWidthInches().compareTo(inches("408"))
        );
        assertEquals(
            0, result.buildableDepthInches().compareTo(inches("600"))
        );
    }

    @Test
    void rejectsNegativeSetback() {
        var result = validator.validate(
            inches("480"), inches("720"),
            inches("-1"), inches("36"),
            inches("60"), inches("60")
        );

        assertFalse(result.valid());
        assertTrue(result.errors().stream()
            .anyMatch(error -> error.contains("negative")));
    }

    @Test
    void rejectsSetbacksThatConsumeEntireWidth() {
        var result = validator.validate(
            inches("480"), inches("720"),
            inches("240"), inches("240"),
            inches("60"), inches("60")
        );

        assertFalse(result.valid());
        assertTrue(result.errors().stream()
            .anyMatch(error -> error.contains("width")));
    }

    @Test
    void rejectsMissingDimensions() {
        var result = validator.validate(
            null, inches("720"),
            inches("36"), inches("36"),
            inches("60"), inches("60")
        );

        assertFalse(result.valid());
        assertTrue(result.errors().stream()
            .anyMatch(error -> error.contains("required")));
    }
}

