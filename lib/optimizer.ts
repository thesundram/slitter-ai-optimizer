import type { RMCoil, SalesOrder, LineSpec, SlittingPattern, OptimizationResult } from "./slitter-context"

interface Weights {
  w1: number // Yield %
  w2: number // Order completion ratio
  w3: number // Scrap width penalty
  w4: number // Setup penalty
}

// Step 1: Coil-Order Compatibility Filter
function filterCompatibleCoils(coils: RMCoil[], order: SalesOrder): RMCoil[] {
  return coils.filter(
    (coil) =>
      coil.type === order.type && coil.grade === order.grade && Math.abs(coil.thickness - order.thickness) < 0.1,
  )
}

// Step 2: Generate slitting patterns for a coil
function generatePatterns(coil: RMCoil, orders: SalesOrder[], lineSpec: LineSpec): SlittingPattern[] {
  const patterns: SlittingPattern[] = []
  const edgeTrim = lineSpec.scrapEdgeMin * 2
  const usableWidth = coil.width - edgeTrim

  // Get compatible orders
  const compatibleOrders = orders.filter(
    (o) =>
      o.type === coil.type &&
      o.grade === coil.grade &&
      Math.abs(o.thickness - coil.thickness) < 0.1 &&
      o.requiredWidth >= lineSpec.minSlitWidth &&
      o.requiredWidth <= lineSpec.maxSlitWidth,
  )

  if (compatibleOrders.length === 0) return patterns

  // Sort by priority (High first) then by width (descending)
  const sortedOrders = [...compatibleOrders].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.requiredWidth - a.requiredWidth
  })

  // Generate patterns using greedy bin-packing approach
  for (let attempt = 0; attempt < 3; attempt++) {
    const slitWidths: { width: number; orderId?: string; quantity: number }[] = []
    let remainingWidth = usableWidth
    let knifeCount = 0

    // Shuffle order for different attempts
    const orderPool = attempt === 0 ? [...sortedOrders] : [...sortedOrders].sort(() => Math.random() - 0.5)

    for (const order of orderPool) {
      if (knifeCount >= lineSpec.maxKnives - 1) break

      // Try to fit as many of this width as possible
      const maxFit = Math.floor(remainingWidth / order.requiredWidth)
      if (maxFit > 0) {
        const quantity = Math.min(maxFit, Math.ceil(order.weight / (coil.weight / (coil.width / order.requiredWidth))))
        slitWidths.push({
          width: order.requiredWidth,
          orderId: order.orderId,
          quantity: quantity,
        })
        remainingWidth -= order.requiredWidth * quantity
        knifeCount += quantity
      }
    }

    if (slitWidths.length > 0) {
      const totalSlitWidth = slitWidths.reduce((sum, s) => sum + s.width * s.quantity, 0)
      const scrapWidth = coil.width - totalSlitWidth
      const yieldPercent = (totalSlitWidth / coil.width) * 100

      patterns.push({
        id: `pattern-${coil.coilId}-${attempt}`,
        coilId: coil.coilId,
        patternId: `P${attempt + 1}`,
        slitWidths,
        scrapWidth,
        yieldPercent,
        score: 0,
        assignedLine: coil.lineCompatibility[0],
      })
    }
  }

  return patterns
}

// Step 3: Score patterns
function scorePattern(pattern: SlittingPattern, orders: SalesOrder[], weights: Weights): number {
  const yieldScore = pattern.yieldPercent * (weights.w1 / 100)

  // Calculate order completion ratio
  const ordersInPattern = pattern.slitWidths.filter((s) => s.orderId).length
  const completionRatio = orders.length > 0 ? (ordersInPattern / orders.length) * 100 : 0
  const completionScore = completionRatio * (weights.w2 / 100)

  // Scrap penalty
  const scrapPenalty = (pattern.scrapWidth / 10) * (weights.w3 / 100)

  // Setup penalty (based on number of different widths)
  const uniqueWidths = new Set(pattern.slitWidths.map((s) => s.width)).size
  const setupPenalty = uniqueWidths * (weights.w4 / 100)

  return yieldScore + completionScore - scrapPenalty - setupPenalty
}

// Step 5: Assign patterns to slitter lines
function assignToLines(patterns: SlittingPattern[], lineSpecs: LineSpec[]): SlittingPattern[] {
  const line1Patterns: SlittingPattern[] = []
  const line2Patterns: SlittingPattern[] = []

  for (const pattern of patterns) {
    // Alternate between lines for load balancing
    if (line1Patterns.length <= line2Patterns.length) {
      const line1 = lineSpecs.find((l) => l.lineName === "Line-1")
      if (line1) {
        pattern.assignedLine = "Line-1"
        line1Patterns.push(pattern)
      }
    } else {
      const line2 = lineSpecs.find((l) => l.lineName === "Line-2")
      if (line2) {
        pattern.assignedLine = "Line-2"
        line2Patterns.push(pattern)
      }
    }
  }

  return [...line1Patterns, ...line2Patterns]
}

// Main optimization function
export function runOptimization(
  coils: RMCoil[],
  orders: SalesOrder[],
  lineSpecs: LineSpec[],
  weights: Weights,
): OptimizationResult {
  const allPatterns: SlittingPattern[] = []

  // Generate patterns for each coil
  for (const coil of coils) {
    const lineSpec = lineSpecs.find((l) => coil.lineCompatibility.includes(l.lineName as "Line-1" | "Line-2"))

    if (!lineSpec) continue

    const patterns = generatePatterns(coil, orders, lineSpec)

    // Score each pattern
    for (const pattern of patterns) {
      pattern.score = scorePattern(pattern, orders, weights)
    }

    allPatterns.push(...patterns)
  }

  // Sort by score and take best patterns
  allPatterns.sort((a, b) => b.score - a.score)

  // Select best non-overlapping patterns
  const selectedPatterns: SlittingPattern[] = []
  const usedCoils = new Set<string>()

  for (const pattern of allPatterns) {
    if (!usedCoils.has(pattern.coilId)) {
      selectedPatterns.push(pattern)
      usedCoils.add(pattern.coilId)
    }
    if (selectedPatterns.length >= coils.length) break
  }

  // Assign to lines
  const assignedPatterns = assignToLines(selectedPatterns, lineSpecs)

  // Calculate summary metrics
  const totalYield =
    assignedPatterns.length > 0
      ? assignedPatterns.reduce((sum, p) => sum + p.yieldPercent, 0) / assignedPatterns.length
      : 0

  const totalScrap = assignedPatterns.reduce((sum, p) => sum + p.scrapWidth, 0)

  const coveredOrderIds = new Set<string>()
  for (const pattern of assignedPatterns) {
    for (const slit of pattern.slitWidths) {
      if (slit.orderId) coveredOrderIds.add(slit.orderId)
    }
  }

  return {
    patterns: assignedPatterns,
    totalYield,
    totalScrap,
    ordersCovered: coveredOrderIds.size,
    totalOrders: orders.length,
  }
}
