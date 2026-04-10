package com.tradearena.adminservice.dto;

import java.util.List;

public class CategoryRequestDto {

	private String categoryName;
	private String categoryIcon;
	private String subCategoryName;
	private String subCategoryIcon;
	private List<QuestionDto> questions;

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getCategoryIcon() {
		return categoryIcon;
	}

	public void setCategoryIcon(String categoryIcon) {
		this.categoryIcon = categoryIcon;
	}

	public String getSubCategoryName() {
		return subCategoryName;
	}

	public void setSubCategoryName(String subCategoryName) {
		this.subCategoryName = subCategoryName;
	}

	public String getSubCategoryIcon() {
		return subCategoryIcon;
	}

	public void setSubCategoryIcon(String subCategoryIcon) {
		this.subCategoryIcon = subCategoryIcon;
	}

	public List<QuestionDto> getQuestions() {
		return questions;
	}

	public void setQuestions(List<QuestionDto> questions) {
		this.questions = questions;
	}
}