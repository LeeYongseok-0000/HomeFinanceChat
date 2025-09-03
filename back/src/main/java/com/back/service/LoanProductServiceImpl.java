package com.back.service;

import com.back.domain.LoanProduct;
import com.back.repository.LoanProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanProductServiceImpl implements LoanProductService {
    
    @Autowired
    private LoanProductRepository loanProductRepository;
    
    @Override
    public List<LoanProduct> getAllProducts() {
        return loanProductRepository.findAll();
    }
    
    @Override
    public List<LoanProduct> getProductsByBank(String bank) {
        return loanProductRepository.findByBank(bank);
    }
    
    @Override
    public List<LoanProduct> getYouthPreferenceProducts() {
        return loanProductRepository.findByYouthPreferenceTrue();
    }
    
    @Override
    public List<LoanProduct> getMobileAvailableProducts() {
        return loanProductRepository.findByMobileAvailableTrue();
    }
} 