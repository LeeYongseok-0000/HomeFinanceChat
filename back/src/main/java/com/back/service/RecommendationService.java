package com.back.service;

import com.back.dto.RecommendationResult;
import com.back.dto.UserConditions;

public interface RecommendationService {
    RecommendationResult recommend(UserConditions userConditions);
} 