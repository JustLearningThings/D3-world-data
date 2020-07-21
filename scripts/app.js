d3.queue()
  .defer(d3.csv, '../data/urban_population.csv', row => filterCSVData(row, 'urban population'))
  .defer(d3.csv, '../data/forest_area.csv', row => filterCSVData(row, 'forest area'))
  .defer(d3.csv, '../data/co2.csv', row => filterCSVData(row, 'co2 emissions'))
  .defer(d3.csv, '../data/arable_land.csv', row => filterCSVData(row, 'arable land'))
  .defer(d3.json, 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
  .await((error, urban_populationData, forest_areaData, co2Data, arable_landData, map) => {
  	if(error) throw error;

  	resolveCountryNames([urban_populationData, forest_areaData, co2Data, arable_landData]);

  	var geoData = topojson.feature(map, map.objects.countries).features;
	changeMapCountryNames(geoData)

  	var data = bundleCSVData([{data: urban_populationData, category: 'urban_population'}, {data: forest_areaData, category: 'forest_area'}, {data: co2Data, category: 'co2_emissions'}, {data: arable_landData, category: 'arable_land'}]);
	relateDataToMap(data, geoData);

  	d3.select('#heading-button')
  	  .on('click', () => {
  	  	mapSVG
  	  	  .classed('svg-appear', true)
  	  	  .style('display', 'block');
  	  	chartSVG
  	  	  .style('display', 'block');
  	  	d3.select('#controllers')
  	  	  .classed('svg-appear', true)
  	  	  .style('display', 'flex');

	  	createMapLegend();
	  	createMap(geoData, data, 'urban_population');
	  	d3.select('#heading')
	  	  .classed('heading-disappeared', true);
	  	d3.select('#heading-inner-container')
	  	  .classed('heading-disappeared', true);
  	  });

  	var mapIsCreated = false;

  	select.on('change', () => { 
  		createMap(geoData, data, d3.event.target.value);
  		mapSVG.node().scrollIntoView({behavior: 'smooth'})
  	});
});

function filterCSVData(row) {	
	var years = {1990: +row['1990 [YR1990]'], 2000: +row['2000 [YR2000]'], 2010: +row['2010 [YR2010]'], 2011: +row['2011 [YR2011]'], 2012: +row['2012 [YR2012]'], 2013: +row['2013 [YR2013]'], 2014: +row['2014 [YR2014]'], 2015: +row['2015 [YR2015]'], 2016: +row['2016 [YR2016]']};
  	
  	return {
  		data: years,
  		country: row["Country Name"]
  	};
}

// some names are different in csv data and in map data
function resolveCountryNames(dataArr) {
	dataArr.forEach(collection => {
		collection.forEach(d => {
			switch (d['country']) {
				case 'Bahamas, The' : d['country'] = 'Bahamas'; break;
				case 'Czech Republic' : d['country'] = 'Czechia'; break;
				case 'Slovak Republic' : d['country'] = 'Slovakia'; break;
				case 'Egypt, Arab Rep.' : d['country'] = 'Egypt'; break;
				case 'Iran, Islamic Rep.' : d['country'] = 'Iran'; break;
				case 'Russian Federation' : d['country'] = 'Russia'; break;
				case 'Kyrgyz Republic' : d['country'] = 'Kyrgyzstan'; break;
				case 'Korea, Rep.' : d['country'] = 'South Korea'; break;
				case 'Korea, Dem. People’s Rep.' : d['country'] = 'North Korea'; break;
				case 'Lao PDR' : d['country'] = 'Laos'; break;
				case 'Yemen, Rep.' : d['country'] = 'Yemen'; break;
				case 'South Sudan' : d['country'] = 'S. Sudan'; break;
				case 'Congo, Dem. Rep.' : d['country'] = 'Dem. Rep. Congo'; break;
				case 'Congo, Rep.' : d['country'] = 'Congo'; break;
				case 'Central African Republic' : d['country'] = 'Central African Rep.'; break;
				case 'Cote d\'Ivoire' : d['country'] = 'Côte d\'Ivoire'; break;
				case 'Syrian Arab Republic' : d['country'] = 'Syria'; break;
				case 'Bosnia and Herzegovina' : d['country'] = 'Bosnia and Herz.'; break;
				case 'Faroe Islands' : d['country'] = 'Faeroe Is.'; break;
				case 'Dominican Republic' : d['country'] = 'Dominican Rep.'; break;
				case 'Venezuela, RB' : d['country'] = 'Venezuela'; break;
				case 'United States' : d['country'] = 'United States of America'; break;
			}
		})
	});
}

// change some names on the map itself
function changeMapCountryNames(geoData) {
	for(let i = 0; i < geoData.length; i++) {
		switch (geoData[i].properties.name) {
			case 'Macedonia' : geoData[i].properties.name = 'North Macedonia'; break;
			case 'eSwatini' : geoData[i].properties.name = 'Eswatini'; break;
			case 'Palestine' : geoData[i].properties.name = 'West Bank and Gaza'; break;
			case 'Eq. Guinea': geoData[i].properties.name = 'Equatorial Guinea'; break;
		}
	}
}

function bundleCSVData(dataArr) {
	var data = {};

	// make the data skeleton first
	dataArr.forEach(_data => {
		_data.data.forEach(row => {
			data[_data.category] = {};
		});
	});

	// populate with data
	dataArr.forEach(_data => {
		_data.data.forEach(row => {
			data[_data.category][row.country] = row.data;
		});
	});

	return data;
}

function relateDataToMap(data, map) {
	for(category in data) {
		for(country in data[category]) {
			map.forEach(c => {
				if(c.properties.name === country) {
					c.properties[category] = data[category][country];
				}
			});
		}
	}
}


// add smooth scroll to up link
d3.selectAll('#up')
  .on('click', () => {
  	d3.event.preventDefault();
    
	d3.select('#map').node().scrollIntoView({behavior: 'smooth'});
  })