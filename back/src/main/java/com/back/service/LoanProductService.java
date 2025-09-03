package com.back.service;

import com.back.domain.LoanProduct;
import java.util.List;

public interface LoanProductService {
    
    List<LoanProduct> getAllProducts();
    
    List<LoanProduct> getProductsByBank(String bank);
    
    List<LoanProduct> getYouthPreferenceProducts();
    
    List<LoanProduct> getMobileAvailableProducts();
} 