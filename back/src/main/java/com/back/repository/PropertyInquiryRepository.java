package com.back.repository;

import com.back.domain.PropertyInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
    
    List<PropertyInquiry> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
    
    @Query("SELECT pi FROM PropertyInquiry pi WHERE pi.property.id = :propertyId ORDER BY pi.createdAt DESC")
    List<PropertyInquiry> findInquiriesByPropertyId(@Param("propertyId") Long propertyId);
    
    List<PropertyInquiry> findByWriterEmailOrderByCreatedAtDesc(String writerEmail);
} 