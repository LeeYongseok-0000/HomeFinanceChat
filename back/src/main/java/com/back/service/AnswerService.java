package com.back.service;

import com.back.domain.Answer;

import java.util.List;

public interface AnswerService {
    Answer save(Long boardId, String content, String writer);
    List<Answer> getAnswers(Long boardId);
    void delete(Long answerId);
}
