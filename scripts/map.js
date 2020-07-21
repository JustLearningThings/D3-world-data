var mapSVG = d3.select('#map');
var select = d3.select('select');
var tooltip = d3.select('#tooltip');

// define colors for color scales
var colors = {
  	urban_population: ["DarkKhaki", "Crimson"],
    forest_area: ["BlanchedAlmond", "DarkGreen"],
  	co2_emissions: ["LemonChiffon", "Maroon"],
  	arable_land: ["Wheat", "SeaGreen"]
  };
var lastSelected;

function createMap(geoData, data, category) {
	var projection = d3.geoMercator()
					   .scale(150)
					   .translate([480, 300])

    if(lastSelected) d3.select(lastSelected)
    				   .classed('selected-country', false);

    var path = d3.geoPath()
    			 .projection(projection);

    // determine max value for scale
    var valuesArr = [];
    for(country in data[category])
    	valuesArr.push(data[category][country][2016]);

    var valuesExtremes = d3.extent(valuesArr);

    var colorScale = d3.scaleLinear()
    				   .domain([0, d3.max(valuesArr)])
    				   .range(colors[category]);

    var zoom = d3.zoom()
    			 .scaleExtent([1, 8])
    			 .translateExtent([[0, 0], [Number(mapSVG.style('width').split('px').join('')), Number(mapSVG.style('height').split('px').join(''))]])
    			 .on('zoom', zoomed);
    mapSVG.call(zoom)
		    // .on("mousedown.zoom", null)
		    // .on("touchstart.zoom", null)
		    // .on("touchmove.zoom", null)
		    // .on("touchend.zoom", null);

   var update = mapSVG
      .selectAll('.country')
      .data(geoData);

    var updateSelection = update
      .enter()
      .append('path')
        .classed('country', true)
        .attr('d', path)
      .merge(update);

    updateSelection
      .transition()
        .duration(750)
          .style('fill', d => {
            var hasData = false;
            var val;
          	if(d.properties.hasOwnProperty(category)) {
              for(year in d.properties[category])
                if(!isNaN(d.properties[category][year])) {
                  hasData = true;
                  val = d.properties[category][year];
                }
          }
            return hasData ? colorScale(val) : '#ccc';
        });

    var color;

    updateSelection
      .on('mouseenter', () => color = d3.select(d3.event.target)
      									.style('fill'))
      .on('mousemove', d => showTooltip(d.properties.name))
      .on('mouseout', () => hideTooltip(color))
      .on('click', () => {
      	var data = d3.select(d3.event.target).data()[0].properties[category];
      	var country = d3.select(d3.event.target).data()[0].properties.name;

      	d3.select(lastSelected)
      	  .classed('selected-country', false);
      	lastSelected = d3.event.target;
      	d3.select(d3.event.target)
      	  .classed('selected-country', true);

      	createBarChart(data, country);
      	chartSVG.node().scrollIntoView({behavior: 'smooth'});
      });

    mapLegend(category, valuesExtremes)
}

function createMapLegend() {
	mapSVG
	  .append('rect')
	    .style('fill', 'white')
	    .attr('width', 225)
	    .attr('height', 135)
	    .attr('x', 25)
	    .attr('y', 420)
	    .attr('fill', 'whitesmoke')
	    .attr('stroke', 'black')

    mapSVG
      .append('text')
       .classed('legend-text-unknown', true)
       .attr('text-anchor', 'end')
       .attr('x', 85)
       .attr('y', 540)
       .text('No data: ');

    mapSVG
      .append('circle')
        .classed('legend-circle-unknown', true)
        .attr('cx', 105)
        .attr('cy', 535)
        .attr('r', 10)
        .attr('stroke', 'black')
        .attr('fill', '#ccc');
}

function clearMapLegend1() {
	mapSVG
	  .selectAll('rect')
	  .remove();
	mapSVG
	  .select('.legend-title')
	  .remove();
	mapSVG
	  .selectAll('.legend-circle')
	  .remove();
	mapSVG
	  .selectAll('.legend-text')
	  .remove();
}

function clearMapLegend() {
	mapSVG
	  .select('.legend-title')
	  .remove();
	mapSVG
	  .selectAll('.legend-circle')
	  .remove();
	mapSVG
	  .selectAll('.legend-text')
	  .remove();
}

function updateMapLegend(category, extremes) {
	mapSVG
	  .append('text')
	  .classed('legend-text legend-title', true)
	  .attr('text-anchor', 'middle')
	  .attr('x', 137.5)
	  .attr('y', 450)
	  .text(formatTitle(category));

    mapSVG
      .append('text')
        .classed('legend-text', true)
          .attr('text-anchor', 'start')
          .attr('x', 30)
          .attr('y', 510)
          .text(`upto maximal (${extremes[1].toFixed(2)})`);

    mapSVG
      .append('circle')
        .classed('legend-circle', true)
        .attr('cx', 225)
        .attr('cy', 505)
        .attr('r', 10)
        .attr('stroke', 'black')
        .attr('fill', colors[category][1]);

    mapSVG
      .append('text')
        .classed('legend-text', true)
        .attr('text-anchor', 'start')
        .attr('x', 30)
        .attr('y', 480)
        .text(`From minimal (${extremes[0].toFixed(2)})`);

    mapSVG
      .append('circle')
        .classed('legend-circle', true)
        .attr('cx', 225)
        .attr('cy', 475)
        .attr('r', 10)
        .attr('stroke', 'black')
        .attr('fill', colors[category][0]);
}

function mapLegend(category, extremes) {
	clearMapLegend1();
	createMapLegend();
	updateMapLegend(category, extremes)
}

// transforms 'abc_d' to 'Abc d'
function formatTitle(str) {
	str = str.split('_').join(' ');

	return str.charAt(0).toUpperCase() + str.slice(1);
}

function showTooltip(countrName) {
	tooltip
    .style('padding', '10px')
	  .style('opacity', .75)
	  .style('left', `${d3.event.pageX - (tooltip.node().offsetWidth / 2)}px`)
	  .style('top', `${d3.event.pageY + 30}px`)
	  .text(countrName);

    d3.select(d3.event.target)
      .style('fill', 'Gold');
}

function hideTooltip(color) {
	tooltip
	  .style('opacity', 0)
	  .style('left', '-100px')
	  .style('top', '-100px')
	  .text('');

	  d3.select(d3.event.target)
	    .style('fill', color);
}

function zoomed() {
	d3.selectAll('.country')
	  .attr('transform', d3.event.transform);
}