package com.back.service;

import com.back.domain.Member;
import com.back.domain.Property;
import com.back.domain.PropertyReviewRequest;
import com.back.dto.PropertyReviewRequestDTO;
import com.back.repository.MemberRepository;
import com.back.repository.PropertyRepository;
import com.back.repository.PropertyReviewRequestRepository;
import com.back.util.CustomFileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class PropertyReviewRequestServiceImpl implements PropertyReviewRequestService {
    
    private final PropertyReviewRequestRepository reviewRequestRepository;
    private final MemberRepository memberRepository;
    private final PropertyRepository propertyRepository;
    private final CustomFileUtil customFileUtil;
    
    @Override
    @Transactional
    public PropertyReviewRequestDTO createReviewRequest(PropertyReviewRequestDTO requestDTO, String memberEmail) {
        Member member = memberRepository.findById(memberEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        PropertyReviewRequest reviewRequest = PropertyReviewRequest.builder()
                .member(member)
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .propertyType(requestDTO.getPropertyType())
                .transactionType(requestDTO.getTransactionType())
                .monthlyRent(requestDTO.getMonthlyRent())
                .address(requestDTO.getAddress())
                .roadAddress(requestDTO.getRoadAddress())
                .detailAddress(requestDTO.getDetailAddress())
                .latitude(requestDTO.getLatitude())
                .longitude(requestDTO.getLongitude())
                .rooms(requestDTO.getRooms())
                .bathrooms(requestDTO.getBathrooms())
                .area(requestDTO.getArea())
                .floor(requestDTO.getFloor())
                .totalFloors(requestDTO.getTotalFloors())
                .yearBuilt(requestDTO.getYearBuilt())
                .parking(requestDTO.getParking())
                .heating(requestDTO.getHeating())
                .petAllowed(requestDTO.getPetAllowed())
                .elevator(requestDTO.getElevator())
                .balcony(requestDTO.getBalcony())
                .tv(requestDTO.getTv())
                .airConditioner(requestDTO.getAirConditioner())
                .shoeCabinet(requestDTO.getShoeCabinet())
                .refrigerator(requestDTO.getRefrigerator())
                .washingMachine(requestDTO.getWashingMachine())
                .bathtub(requestDTO.getBathtub())
                .sink(requestDTO.getSink())
                .induction(requestDTO.getInduction())
                .wardrobe(requestDTO.getWardrobe())
                .fireAlarm(requestDTO.getFireAlarm())
                .imageUrls(requestDTO.getImageUrls() != null ? requestDTO.getImageUrls() : new ArrayList<>())
                .status(PropertyReviewRequest.ReviewStatus.PENDING)
                .build();
        
        PropertyReviewRequest savedRequest = reviewRequestRepository.save(reviewRequest);
        return PropertyReviewRequestDTO.fromEntity(savedRequest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PropertyReviewRequestDTO> getUserReviewRequests(String memberEmail) {
        try {
            log.info("사용자 검수 요청 조회 시작 - Member: {}", memberEmail);
            List<PropertyReviewRequest> requests = reviewRequestRepository.findByMemberEmailOrderByCreatedAtDesc(memberEmail);
            log.info("검수 요청 조회 완료 - {}개", requests.size());
            
            List<PropertyReviewRequestDTO> result = new ArrayList<>();
            for (PropertyReviewRequest request : requests) {
                try {
                    PropertyReviewRequestDTO dto = PropertyReviewRequestDTO.fromEntity(request);
                    result.add(dto);
                } catch (Exception e) {
                    log.error("검수 요청 DTO 변환 실패 - ID: {}, 오류: {}", request.getId(), e.getMessage());
                    continue;
                }
            }
            
            log.info("검수 요청 DTO 변환 완료 - {}개", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("사용자 검수 요청 조회 중 오류 발생: {}", e.getMessage(), e);
            return new ArrayList<>(); // 빈 리스트 반환하여 에러 방지
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PropertyReviewRequestDTO> getAllReviewRequests() {
        List<PropertyReviewRequest> requests = reviewRequestRepository.findAllOrderByCreatedAtDesc();
        return requests.stream()
                .map(PropertyReviewRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PropertyReviewRequestDTO getReviewRequest(Long id) {
        PropertyReviewRequest request = reviewRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("검수 요청을 찾을 수 없습니다."));
        return PropertyReviewRequestDTO.fromEntity(request);
    }
    
    @Override
    @Transactional
    public PropertyReviewRequestDTO approveReviewRequest(Long id, String reviewComment) {
        PropertyReviewRequest request = reviewRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("검수 요청을 찾을 수 없습니다."));
        
        request.setStatus(PropertyReviewRequest.ReviewStatus.APPROVED);
        request.setReviewComment(reviewComment);
        
        PropertyReviewRequest savedRequest = reviewRequestRepository.save(request);
        return PropertyReviewRequestDTO.fromEntity(savedRequest);
    }
    
    @Override
    @Transactional
    public PropertyReviewRequestDTO rejectReviewRequest(Long id, String reviewComment) {
        PropertyReviewRequest request = reviewRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("검수 요청을 찾을 수 없습니다."));
        
        request.setStatus(PropertyReviewRequest.ReviewStatus.REJECTED);
        request.setReviewComment(reviewComment);
        
        PropertyReviewRequest savedRequest = reviewRequestRepository.save(request);
        return PropertyReviewRequestDTO.fromEntity(savedRequest);
    }
    
    @Override
    @Transactional
    public PropertyReviewRequestDTO cancelApprovedReviewRequest(Long id, String reviewComment) {
        PropertyReviewRequest request = reviewRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("검수 요청을 찾을 수 없습니다."));
        
        // 이미 Property로 변환되었는지 확인
        if (request.getStatus() != PropertyReviewRequest.ReviewStatus.APPROVED) {
            throw new RuntimeException("승인된 검수 요청만 취소할 수 있습니다.");
        }
        
        request.setStatus(PropertyReviewRequest.ReviewStatus.PENDING);
        request.setReviewComment(reviewComment);
        
        PropertyReviewRequest savedRequest = reviewRequestRepository.save(request);
        return PropertyReviewRequestDTO.fromEntity(savedRequest);
    }
    
    @Override
    @Transactional
    public void convertApprovedRequestsToProperties() {
        List<PropertyReviewRequest> approvedRequests = reviewRequestRepository.findByStatus(PropertyReviewRequest.ReviewStatus.APPROVED);
        
        if (approvedRequests.isEmpty()) {
            log.info("변환할 승인된 검수 요청이 없습니다.");
            return;
        }
        
        log.info("승인된 검수 요청 {}개를 Property로 변환 시작", approvedRequests.size());
        
        for (PropertyReviewRequest request : approvedRequests) {
            try {
                // 안전한 숫자 변환을 위한 헬퍼 메서드
                Integer rooms = parseIntegerSafely(request.getRooms());
                Integer bathrooms = parseIntegerSafely(request.getBathrooms());
                Double area = parseDoubleSafely(request.getArea());
                Integer floor = parseIntegerSafely(request.getFloor());
                Integer totalFloors = parseIntegerSafely(request.getTotalFloors());
                Integer yearBuilt = parseIntegerSafely(request.getYearBuilt());
                
                // 이미지 URL 로깅
                log.info("검수 요청 이미지 URLs: {}", request.getImageUrls());
                
                Property property = Property.builder()
                        .writer(request.getMember().getNickname())
                        .writerEmail(request.getMember().getEmail())
                        .title(request.getName())
                        .content(request.getDescription())
                        .price(request.getPrice())
                        .propertyType(request.getPropertyType())
                        .transactionType(request.getTransactionType())
                        .monthlyRent(request.getMonthlyRent())
                        .roadAddress(request.getRoadAddress())
                        .detailAddress(request.getDetailAddress())
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .rooms(rooms)
                        .bathrooms(bathrooms)
                        .area(area)
                        .floor(floor)
                        .totalFloors(totalFloors)
                        .yearBuilt(yearBuilt)
                        .parking(request.getParking())
                        .heating(request.getHeating())
                        .petAllowed(request.getPetAllowed())
                        .elevator(request.getElevator())
                        .balcony(request.getBalcony())
                        .tv(request.getTv())
                        .airConditioner(request.getAirConditioner())
                        .shoeCabinet(request.getShoeCabinet())
                        .refrigerator(request.getRefrigerator())
                        .washingMachine(request.getWashingMachine())
                        .bathtub(request.getBathtub())
                        .sink(request.getSink())
                        .induction(request.getInduction())
                        .wardrobe(request.getWardrobe())
                        .fireAlarm(request.getFireAlarm())
                        .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                        .status("판매중")
                        .build();
                
                                            Property savedProperty = propertyRepository.save(property);
                log.info("Property 변환 완료: ID={}, 제목={}, 이미지 개수={}", 
                    savedProperty.getId(), savedProperty.getTitle(), 
                    savedProperty.getImageUrls() != null ? savedProperty.getImageUrls().size() : 0);
                log.info("Property 이미지 URLs: {}", savedProperty.getImageUrls());
            
            // 변환 완료 후 검수 요청 삭제
            reviewRequestRepository.delete(request);
            log.info("검수 요청 삭제 완료: ID={}", request.getId());
            
        } catch (Exception e) {
            log.error("Property 변환 실패 - 검수 요청 ID: {}, 오류: {}", request.getId(), e.getMessage(), e);
            throw new RuntimeException("Property 변환 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    log.info("모든 승인된 검수 요청 변환 및 삭제 완료");
    }
    
    // 안전한 Integer 변환을 위한 헬퍼 메서드
    private Integer parseIntegerSafely(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            log.warn("숫자 변환 실패: '{}' -> null로 설정", value);
            return null;
        }
    }
    
    // 안전한 Double 변환을 위한 헬퍼 메서드
    private Double parseDoubleSafely(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            log.warn("숫자 변환 실패: '{}' -> null로 설정", value);
            return null;
        }
    }
    
    @Override
    public String uploadImage(Long id, MultipartFile imageFile) {
        log.info("이미지 업로드 시작 - 검수 요청 ID: {}, 파일명: {}, 크기: {} bytes", 
                id, imageFile.getOriginalFilename(), imageFile.getSize());
        
        PropertyReviewRequest reviewRequest = reviewRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("검수 요청을 찾을 수 없습니다."));
        
        try {
            // CustomFileUtil을 사용하여 파일 저장
            List<MultipartFile> files = new ArrayList<>();
            files.add(imageFile);
            
            List<String> savedFileNames = customFileUtil.saveFiles(files);
            
            if (savedFileNames.isEmpty()) {
                throw new RuntimeException("파일 저장에 실패했습니다.");
            }
            
            String savedFileName = savedFileNames.get(0);
            log.info("CustomFileUtil을 통해 파일 저장 완료: {}", savedFileName);
            
            // 이미지 URL을 검수 요청에 추가
            List<String> currentImages = reviewRequest.getImageUrls();
            if (currentImages == null) {
                currentImages = new ArrayList<>();
                log.info("새로운 이미지 리스트 생성");
            }
            currentImages.add(savedFileName);
            reviewRequest.setImageUrls(currentImages);
            reviewRequestRepository.save(reviewRequest);
            log.info("검수 요청에 이미지 URL 추가 완료. 총 이미지 개수: {}", currentImages.size());
            
            return savedFileName;
            
        } catch (Exception e) {
            log.error("이미지 업로드 실패: {}", e.getMessage(), e);
            throw new RuntimeException("이미지 업로드에 실패했습니다: " + e.getMessage());
        }
    }
} 