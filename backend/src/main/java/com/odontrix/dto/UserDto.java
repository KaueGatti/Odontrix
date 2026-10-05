package com.odontrix.dto;

import com.odontrix.entity.User;
import com.odontrix.entity.UserProfile;

import java.time.OffsetDateTime;

public record UserDto(Integer id, String username, String email, UserProfile profile,
                      boolean active, boolean forcePasswordChange, OffsetDateTime createdAt) {

	public static UserDto from(User user) {
		return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getProfile(),
				Boolean.TRUE.equals(user.getActive()),
				Boolean.TRUE.equals(user.getForcePasswordChange()),
				user.getCreatedAt());
	}
}
