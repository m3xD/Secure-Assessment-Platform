/*
 * Secure Assessment Platform API
 *
 * API for managing secure online assessments with proctoring features
 *
 * API version: 1.0.0
 * Contact: support@secureassessment.example
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package model

type PageableObject struct {
	Sort *SortObject `json:"sort,omitempty"`

	PageNumber int32 `json:"pageNumber,omitempty"`

	PageSize int32 `json:"pageSize,omitempty"`

	Offset int32 `json:"offset,omitempty"`

	Paged bool `json:"paged,omitempty"`

	Unpaged bool `json:"unpaged,omitempty"`
}
