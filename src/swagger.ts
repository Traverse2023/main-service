import swaggerAutogen from 'swagger-autogen'
import path from 'path';

const doc = {}
const outputFile = './swagger_output.json'

const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc)