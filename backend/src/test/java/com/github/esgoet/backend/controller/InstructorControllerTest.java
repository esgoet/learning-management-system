package com.github.esgoet.backend.controller;

import com.github.esgoet.backend.model.Instructor;
import com.github.esgoet.backend.repository.InstructorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class InstructorControllerTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    InstructorRepository instructorRepository;

    @Test
    @WithMockUser
    void getAllInstructorsTest() throws Exception {
        //WHEN
        mockMvc.perform(get("/api/instructors"))
                //THEN
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @WithMockUser
    @DirtiesContext
    void getInstructorByIdTest() throws Exception {
        //GIVEN
        instructorRepository.save(new Instructor("i1",List.of()));
        //WHEN
        mockMvc.perform(get("/api/instructors/i1"))
                //THEN
                .andExpect(status().isOk())
                .andExpect(content().json("""
                      {
                          "id": "i1",
                          "courses": []
                      }
                      """));
    }

    @Test
    @WithMockUser(authorities = {"INSTRUCTOR"})
    @DirtiesContext
    void updateInstructorTest() throws Exception {
        //GIVEN
        instructorRepository.save(new Instructor("i1", List.of()));
        //WHEN
        mockMvc.perform(put("/api/instructors/i1")
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "courses": ["courseId-1"]
                            }
                            """))
                //THEN
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {
                          "id": "i1",
                          "courses": ["courseId-1"]
                        }
                """));
    }

    @Test
    @WithMockUser(authorities = {"INSTRUCTOR"})
    @DirtiesContext
    void updateInstructorTest_whenInstructorDoesNotExist() throws Exception {
        //WHEN
        mockMvc.perform(put("/api/instructors/i1")
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "courses": ["courseId-1"]
                            }
                            """))
                //THEN
                .andExpect(status().isNotFound())
                .andExpect(content().json("""
                        {
                          "message": "No instructor found with id: i1",
                           "statusCode": 404
                        }
                        """))
                .andExpect(jsonPath("$.timestamp").exists());
    }

}