"use client"

import { useEffect } from "react"

export default function ProtocolHandlerInit() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "registerProtocolHandler" in navigator) {
      try {
        navigator.registerProtocolHandler("web+spainmcp", "/open?uri=%s")
      } catch {
        // Browser may reject if origin is not HTTPS or user already registered
      }
    }
  }, [])

  return null
}
