package com.back.service;

import java.util.stream.Collectors;
import java.util.Set;

import org.springframework.transaction.annotation.Transactional;

import com.back.domain.Member;
import com.back.dto.MemberDTO;
import com.back.dto.MemberModifyDTO;

@Transactional
public interface MemberService {
    
    MemberDTO getKakaoMember(String accessToken);
    MemberDTO getGoogleMember(String accessToken);
    MemberDTO getNaverMember(String accessToken);
    void modifyMember(MemberModifyDTO memberModifyDTO);
    void changePassword(String email, String currentPassword, String newPassword);
    void changeNickname(String email, String newNickname);

     default MemberDTO entityToDTO(Member member){
        
        MemberDTO dto = new MemberDTO(
            member.getEmail(),
             member.getPw(), 
             member.getNickname(), 
             member.isSocial(), 
             member.getMemberRoleList().stream().map(memberRole -> memberRole.name()).collect(Collectors.toList()));
        return dto;
    }
}