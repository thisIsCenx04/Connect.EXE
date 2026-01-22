package com.connectexe.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {
    @Size(max = 255)
    private String fullName;

    private String avatarUrl;

    @Size(max = 255)
    private String headline;

    private String bio;

    @Size(max = 2)
    private String country;

    @Size(max = 120)
    private String city;
}