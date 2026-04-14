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

    public List<T> getContent()                     { return content; }
    public void setContent(List<T> content)         { this.content = content; }

    public int getPage()                            { return page; }
    public void setPage(int page)                   { this.page = page; }

    public int getSize()                            { return size; }
    public void setSize(int size)                   { this.size = size; }

    public long getTotalElements()                  { return totalElements; }
    public void setTotalElements(long totalElements){ this.totalElements = totalElements; }

    public int getTotalPages()                      { return totalPages; }
    public void setTotalPages(int totalPages)       { this.totalPages = totalPages; }
}