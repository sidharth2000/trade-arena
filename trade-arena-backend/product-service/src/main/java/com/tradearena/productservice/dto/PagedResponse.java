package com.tradearena.productservice.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic wrapper for paginated API responses.
 * Used by all listing/search endpoints.
 */
public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public PagedResponse() {}

    public static <T> PagedResponse<T> from(Page<T> page) {
        PagedResponse<T> r = new PagedResponse<>();
        r.content       = page.getContent();
        r.page          = page.getNumber();
        r.size          = page.getSize();
        r.totalElements = page.getTotalElements();
        r.totalPages    = page.getTotalPages();
        r.last          = page.isLast();
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

    public boolean isLast()                         { return last; }
    public void setLast(boolean last)               { this.last = last; }
}
