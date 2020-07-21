var chartSVG = d3.select('#chart');
var barPadding = 17.5;
var padding = 57.5;

function createBarChart(data, country) {
	// filter years with no data
	for(d in data) 
		if(!data[d] || isNaN(data[d])) delete data[d];

    var availableYears = Object.keys(data).map(year => +year);
    var dataByYear = Object.values(data);

    var svgWidth = Number(chartSVG.style('width').split('px').shift());
	var svgHeight = Number(chartSVG.style('height').split('px').shift());

	var barWidth = svgWidth / availableYears.length - barPadding;

    var xScale = d3.scaleBand()
    			   .paddingInner(barPadding)
    			   .domain(availableYears)
    			   .range([padding + 2, svgWidth - 2 * padding - 2]);
    var yScale = d3.scaleLinear()
    			   .domain(d3.extent(dataByYear))
    			   .nice()
    			   .range([svgHeight - padding, padding]);

    d3.selectAll('.axis')
      .remove();
    var xAxis = d3.axisBottom(xScale)
    			    .tickSize(0);
    var yAxis = d3.axisLeft(yScale)
    		        .tickSize(0);

    chartSVG
      .append('g')
        .classed('x-axis axis', true)
        .attr('transform', `translate(${padding / 2 + barPadding / 2}, ${svgHeight - padding})`)
        .call(xAxis);
    chartSVG
      .append('g')
        .classed('y-axis axis', true)
        .attr('transform', `translate(${padding}, 0)`)
        .call(yAxis);

    var chartUpdate = chartSVG
    					.selectAll('.bar')
    				    .data(dataByYear);

    chartUpdate
      .exit()
      .remove();

    chartUpdate
	  .enter()
	  .append('rect')
	    .classed('bar', true)
	 .merge(chartUpdate)
      .on('mousemove', d => showBarTooltip(d3.event.target, d))
      .on('mouseout', d => hideBarTooltip())
      .transition()
      .duration(500)
      .attr('x', (d, i) => xScale(availableYears[i]))
      .attr('y', d => yScale(d))
      .attr('width', barWidth)
      .attr('height', d => svgHeight - yScale(d) - padding)
      .attr('fill', 'SteelBlue');

    // chart title
    chartSVG
      .select('.chart-title')
      .remove();

    chartSVG
      .append('text')
        .classed('chart-title', true)
        .attr('x', svgWidth / 2)
        .attr('y', padding / 2)
        .text(country)
}

function showBarTooltip(bar, data) {
	d3.select('#bar-tooltip')
    .style('padding', '7.5px')
	  .style('opacity', .75)
	  .style('left', `${d3.event.pageX - 30}px`)
	  .style('top', `${d3.event.pageY - 50}px`)
	  .text(data.toLocaleString()) 
}

function hideBarTooltip() {
	d3.select('#bar-tooltip')
	  .style('opacity', 0)
	  .style('left', -100)
	  .style('top', -100)
	  .text('');
}