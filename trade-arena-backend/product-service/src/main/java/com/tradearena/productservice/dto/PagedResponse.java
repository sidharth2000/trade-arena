package com.tradearena.productservice.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public PagedResponse() {}

    public static <T> PagedResponse<T> from(Page<T> p) {
        PagedResponse<T> r = new PagedResponse<>();
        r.content       = p.getContent();
        r.page          = p.getNumber();
        r.size          = p.getSize();
        r.totalElements = p.getTotalElements();
        r.totalPages    = p.getTotalPages();
        return r;
    }

    public List<T> getContent()         { return content; }
    public int getPage()                { return page; }
    public int getSize()                { return size; }
    public long getTotalElements()      { return totalElements; }
    public int getTotalPages()          { return totalPages; }
}