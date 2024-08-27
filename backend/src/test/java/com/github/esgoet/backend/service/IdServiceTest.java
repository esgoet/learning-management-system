package com.github.esgoet.backend.service;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mockStatic;

class IdServiceTest {
    IdService idService = new IdService();

    @Test
    void generateIdTest() {
        //GIVEN
        UUID uuid = UUID.randomUUID();
        try (MockedStatic<UUID> mockedUUID = mockStatic(UUID.class)) {
            mockedUUID.when(UUID::randomUUID).thenReturn(uuid);
            //WHEN
            String actual = idService.randomId();
            //THEN
            String expected = uuid.toString();
            mockedUUID.verify(UUID::randomUUID);
            assertEquals(expected, actual);
        }
    }

}