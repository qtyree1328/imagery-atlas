const fs = require('fs');
const path = require('path');

// Read original data
const originalData = JSON.parse(fs.readFileSync('imagery-atlas-data.json', 'utf8'));
const expandedData = JSON.parse(fs.readFileSync('imagery-atlas-data-expanded.json', 'utf8'));

// Create merged data structure
const mergedData = {
  datasets: [...originalData.datasets, ...expandedData.datasets],
  platforms: [...originalData.platforms]
};

// Add new platforms, avoiding duplicates by ID
const existingPlatformIds = new Set(originalData.platforms.map(p => p.id));
for (const platform of expandedData.platforms) {
  if (!existingPlatformIds.has(platform.id)) {
    mergedData.platforms.push(platform);
  }
}

// Add missing platforms that were referenced but don't exist yet
const additionalPlatforms = [
  {
    id: 'aws-terrain-tiles',
    name: 'AWS Terrain Tiles',
    url: 'https://registry.opendata.aws/terrain-tiles/',
    catalogUrl: 'https://registry.opendata.aws/terrain-tiles/',
    apiUrl: 'S3 REST API',
    api: 'S3 REST, no auth required',
    registration: 'Not required',
    apiKey: 'Not required', 
    rateLimit: 'S3 limits',
    pricing: 'Free',
    formats: ['PNG (Terrarium format)'],
    description: 'Pre-processed SRTM elevation data as PNG tiles optimized for web mapping. Uses Terrarium encoding for elevation values.',
    strengths: ['No auth required', 'Web-optimized tiles', 'Instant access', 'Good for visualization'],
    limitations: ['Limited to SRTM data', 'PNG format requires decoding', 'Visualization oriented'],
    datasets: ['srtm-dem-30m']
  },
  {
    id: 'aws-open-data',
    name: 'AWS Open Data',
    url: 'https://registry.opendata.aws/',
    catalogUrl: 'https://registry.opendata.aws/',
    apiUrl: 'S3 REST API',
    api: 'S3 REST, various formats',
    registration: 'Not required',
    apiKey: 'Not required',
    rateLimit: 'S3 limits', 
    pricing: 'Free (egress charges may apply)',
    formats: ['Various'],
    description: 'Registry of open datasets hosted on AWS S3. Includes many geospatial datasets with different access patterns.',
    strengths: ['No auth required', 'Multiple datasets', 'Cloud-native access', 'Well documented'],
    limitations: ['Egress charges outside AWS', 'Various access patterns', 'No unified API'],
    datasets: ['usgs-3dep-lidar-copc', 'usgs-3dep-lidar-ept']
  },
  {
    id: 'copernicus-dem',
    name: 'Copernicus DEM Portal',
    url: 'https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model',
    catalogUrl: 'https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model',
    apiUrl: 'REST API',
    api: 'REST download API',
    registration: 'Not required',
    apiKey: 'Not required',
    rateLimit: 'Fair use',
    pricing: 'Free',
    formats: ['GeoTIFF'],
    description: 'Official Copernicus Digital Elevation Model portal providing 30m and 90m resolution DEMs based on TanDEM-X.',
    strengths: ['Official EU source', 'High quality', 'Free access', 'Global coverage'],
    limitations: ['Manual download', 'Limited API features'],
    datasets: ['tandem-x-global-dem']
  },
  {
    id: 'asi-cosmo',
    name: 'ASI COSMO-SkyMed',
    url: 'https://www.asi.it/earth-observation/cosmo-skymed/',
    catalogUrl: 'https://www.asi.it/earth-observation/cosmo-skymed/',
    apiUrl: 'Commercial access',
    api: 'Commercial distribution',
    registration: 'Commercial contract required',
    apiKey: 'Commercial access',
    rateLimit: 'Commercial terms',
    pricing: 'Commercial licensing',
    formats: ['HDF5', 'GeoTIFF'],
    description: 'Italian Space Agency portal for COSMO-SkyMed X-band SAR constellation data. Commercial access only.',
    strengths: ['High resolution X-band SAR', 'Rapid revisit (constellation)', 'Multiple polarizations'],
    limitations: ['Commercial only', 'No free access', 'Complex licensing'],
    datasets: ['cosmo-skymed']
  }
];

// Add missing platforms
for (const platform of additionalPlatforms) {
  if (!mergedData.platforms.find(p => p.id === platform.id)) {
    mergedData.platforms.push(platform);
  }
}

// Write merged data
fs.writeFileSync('imagery-atlas-data-merged.json', JSON.stringify(mergedData, null, 2));

// Generate statistics
console.log('Merge completed:');
console.log(`Total datasets: ${mergedData.datasets.length}`);
console.log(`Total platforms: ${mergedData.platforms.length}`);

// Count by type
const typeStats = {};
for (const dataset of mergedData.datasets) {
  typeStats[dataset.type] = (typeStats[dataset.type] || 0) + 1;
}

console.log('\nDataset types:');
Object.entries(typeStats).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nNew additions summary:');
console.log('- Added comprehensive LiDAR sources (USGS 3DEP COPC/EPT, NOAA, ICESat-2, GEDI, OpenTopography)');
console.log('- Expanded SAR/radar (SRTM, TerraSAR-X, TanDEM-X, COSMO-SkyMed)');
console.log('- Expanded aerial imagery (UK EA, Germany DOP, USGS historical, OpenAerialMap, IGN France)');
console.log('- Added corresponding platforms for data access');