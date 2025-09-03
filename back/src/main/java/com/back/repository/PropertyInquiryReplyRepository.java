package com.back.repository;

import com.back.domain.PropertyInquiryReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyInquiryReplyRepository extends JpaRepository<PropertyInquiryReply, Long> {
    
    List<PropertyInquiryReply> findByInquiryIdOrderByCreatedAtAsc(Long inquiryId);
    
    List<PropertyInquiryReply> findByWriterEmailOrderByCreatedAtDesc(String writerEmail);
} 