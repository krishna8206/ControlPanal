// Frontend service for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://panalsbackend-production.up.railway.app/api"

class ReportsService {
  // Helper method for API calls with error handling
  async apiCall(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/reports/${endpoint}?${queryString}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Add timeout handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        // Try to parse error response
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: `HTTP error! status: ${response.status}` }
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error)
      // Return a standardized error response
      return {
        success: false,
        message: error.message || "API request failed",
        data: null,
      }
    }
  }

  async getEarningsData(params = {}) {
    return this.apiCall("earnings", params)
  }

  async getSummaryData(params = {}) {
    return this.apiCall("summary", params)
  }

  async getDriverPerformance(params = {}) {
    return this.apiCall("drivers/performance", params)
  }

  async getDriversList() {
    return this.apiCall("drivers/list")
  }

  async getRidesAnalytics(params = {}) {
    return this.apiCall("rides/analytics", params)
  }

  async exportReportData(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/reports/export?${queryString}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: params.format === "csv" ? "text/csv" : "application/json",
        },
        signal: AbortSignal.timeout(60000), // 60 second timeout for exports
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (params.format === "csv") {
        return await response.text()
      }

      return await response.json()
    } catch (error) {
      console.error("Export error:", error)
      return {
        success: false,
        message: error.message || "Export failed",
        data: null,
      }
    }
  }

  // Method to download CSV directly
  async downloadCsvReport(params = {}) {
    try {
      const queryString = new URLSearchParams({ ...params, format: "csv" }).toString()
      const url = `${API_BASE_URL}/reports/export?${queryString}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `report_${params.timeRange || "custom"}_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      return { success: true }
    } catch (error) {
      console.error("CSV download error:", error)
      return {
        success: false,
        message: error.message || "CSV download failed",
      }
    }
  }
}

export const reportsService = new ReportsService()
