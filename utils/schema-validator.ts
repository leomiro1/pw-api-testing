import fs from 'fs/promises'
import path from 'path'
import Ajv from 'ajv'
import { createSchema } from 'genson-js';
import addFormats from 'ajv-formats'

const SCHEMA_BASE_PATH = './response-schemas'
const ajv = new Ajv({allErrors: true})
addFormats(ajv)

export async function validateSchema(dirName:string, fileName:string, responseBody: object, createSchemaFlag: boolean = false){
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`)
    
    if (createSchemaFlag) await generateNewSchema(responseBody,schemaPath)
        
    const schema = await loadSchema(schemaPath)
    const validate = ajv.compile(schema)

    const valid = validate(responseBody)
    if(!valid){
        throw new Error(
            `Schema validation ${fileName}_schema.json failed:\n` +
            `${JSON.stringify(validate.errors,null,4,)}\n\n` +
            `Actual response body:\n` +
            `${JSON.stringify(responseBody,null,4,)}`
        )
    }
}

async function loadSchema (schemaPath:string){
    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8')
        return JSON.parse(schemaContent)
    } catch(error:any){
        throw new Error(`Failed to read the schema file: ${error.message}`)
    }
}

async function generateNewSchema (responseBody: object, schemaPath: string) {
        try {
            let generatedSchema = createSchema(responseBody)
            generatedSchema = addDateTimeFormat(generatedSchema)
            await fs.mkdir(path.dirname(schemaPath), {recursive: true})
            await fs.writeFile(schemaPath,JSON.stringify(generatedSchema, null, 4))
        } catch (error:any) {
            throw new Error(`Failed to create schema file ${error.message}`)
        }
    
}

function addDateTimeFormat(schema: any): any {
    if (!schema || typeof schema !== 'object') {
        return schema
    }

    if (Array.isArray(schema)) {
        return schema.map(item => addDateTimeFormat(item))
    }

    const result = { ...schema }

    // Check if this object has properties
    if (result.properties && typeof result.properties === 'object') {
        for (const [key, value] of Object.entries(result.properties)) {
            if ((key === 'createdAt' || key === 'updatedAt') && typeof value === 'object' && value !== null) {
                // Add format: "date-time" if type is string
                if ((value as any).type === 'string') {
                    (result.properties[key] as any).format = 'date-time'
                }
            }
            // Recursively process nested objects and arrays
            (result.properties[key] as any) = addDateTimeFormat(value)
        }
    }

    // Handle array items
    if (result.items && typeof result.items === 'object') {
        result.items = addDateTimeFormat(result.items)
    }

    return result
}