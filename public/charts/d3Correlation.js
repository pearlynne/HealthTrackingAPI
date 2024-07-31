function createCorrelogram(reports) {
  const variables = ["hyperactivity", "impulsivity", "inattentiveness", "mood"];
  const frequencyMap = new Map();

  const marginWhole = { top: 10, right: 10, bottom: 10, left: 10 };
  const sizeWhole = 640 - marginWhole.left - marginWhole.right;

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", sizeWhole + marginWhole.left + marginWhole.right)
    .attr("height", sizeWhole + marginWhole.top + marginWhole.bottom)
    .append("g")
    .attr("transform", `translate(${marginWhole.left},${marginWhole.top})`);

  const size = sizeWhole / variables.length;
  const position = d3
    .scalePoint()
    .domain(variables)
    .range([0, sizeWhole - size]);

  // Convert reports object to an array of values
  const data = reports.map((d) => ({
    hyperactivity: d.hyperactivity,
    impulsivity: d.impulsivity,
    inattentiveness: d.inattentiveness,
    mood: d.mood,
  }));

  data.forEach((d) => {
    variables.forEach((var1) => {
      variables.forEach((var2) => {
        if (var1 !== var2) {
          const key = `${d[var1]}-${d[var2]}`;
          if (!frequencyMap.has(key)) {
            frequencyMap.set(key, 0);
          }
          frequencyMap.set(key, frequencyMap.get(key) + 1);
        }
      });
    });
  });

  function createBins(data, domain, numBins) {
    const binSize = (domain[1] - domain[0]) / numBins;
    const bins = Array.from({ length: numBins }, (_, i) => ({
      x0: domain[0] + i * binSize,
      x1: domain[0] + (i + 1) * binSize,
      length: 0,
    }));

    data.forEach((d) => {
      const index = Math.min(
        numBins - 1,
        Math.floor((d - domain[0]) / binSize)
      );
      bins[index].length += 1;
    });

    return bins;
  }

  for (let i = 0; i < variables.length; i++) {
    for (let j = 0; j < variables.length; j++) {
      const var1 = variables[i];
      const var2 = variables[j];

      const xExtent = [0, 5];
			const maxFrequency = Math.max(...frequencyMap.values());
			const z = d3.scaleSqrt().domain([0, maxFrequency]).range([1, 10]); // Adjust the range as needed
			
      const x = d3
        .scaleLinear()
        .domain(xExtent)
        .range([0, size - 20]);
      const y =
        var1 === var2
          ? d3
              .scaleLinear()
              .domain(d3.extent(data, (d) => d[var2]))
              .range([size - 20, 0])
          : d3
              .scaleLinear()
              .domain([0, 5])
              .range([size - 20, 0]);

      const g = svg
        .append("g")
        .attr("transform", `translate(${position(var1)},${position(var2)})`);

      if (var1 === var2) {
        // Histogram on the diagonal
        const bins = createBins(
          data.map((d) => d[var1]),
          xExtent,
          10
        );
        const yHist = d3
          .scaleLinear()
          .domain([0, d3.max(bins, (d) => d.length)])
          .range([size - 20, 0]);

        g.selectAll(".histogram")
          .data(bins)
          .enter()
          .append("g")
          .attr("class", "histogram")
          .append("rect")
          .attr("x", (d) => x(d.x0))
          .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1)) // Reduce width slightly to prevent overlap
          .attr("y", (d) => yHist(d.length))
          .attr("height", (d) => Math.max(0, size - 20 - yHist(d.length)))
          .attr("fill", "steelblue")
          .attr("opacity", 0.6);

        g.append("text")
          .attr("x", size / 2)
          .attr("y", size / 2)
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("font-size", "12px")
          .style("fill", "black")
          .text(var1);

        g.append("g")
          .attr("transform", `translate(0,${size - 20})`)
          .call(d3.axisBottom(x).ticks(3));
      } else {
        // Scatter plot
        g.append("g").call(d3.axisLeft(y).ticks(3));

        g.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d[var1]))
          .attr("cy", (d) => y(d[var2]))
          .attr("r", d => {
						const key = `${d[var1]}-${d[var2]}`;
						return z(frequencyMap.get(key));
					})
          .attr("fill", "steelblue");

        g.append("g")
          .attr("transform", `translate(0,${size - 20})`)
          .call(d3.axisBottom(x).ticks(3));
      }
    }
  }
}

export default createCorrelalogram;
