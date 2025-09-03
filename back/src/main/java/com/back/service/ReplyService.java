package com.back.service;

import com.back.domain.Reply;

import java.util.List;

public interface ReplyService {
    Reply save(Long answerId, String content, String writer);
    List<Reply> getRepliesByAnswer(Long answerId);
    void delete(Long replyId);
} 