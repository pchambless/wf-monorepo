import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class WfDbQuery implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WF Database Query',
		name: 'wfDbQuery',
		icon: 'fa:database',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Execute SQL queries via WhatsFresh adhoc-query workflow',
		defaults: {
			name: 'WF DB Query',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'SQL Query',
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 8,
				},
				default: '',
				required: true,
				placeholder: 'SELECT * FROM api_wf.plans WHERE id = :planId',
				description: 'SQL query to execute. Use :paramName for parameters.',
			},
			{
				displayName: 'Parameters',
				name: 'params',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Parameter',
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'planId',
								description: 'Parameter name (without colon)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: '75',
								description: 'Parameter value',
							},
						],
					},
				],
				description: 'Query parameters for :paramName substitution',
			},
			{
				displayName: 'Agent Name',
				name: 'agent',
				type: 'string',
				default: 'n8n-workflow',
				description: 'Agent name for logging',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const query = this.getNodeParameter('query', i) as string;
				const paramsData = this.getNodeParameter('params', i) as any;
				const agent = this.getNodeParameter('agent', i) as string;

				// Build params object from fixedCollection
				const params: any = {};
				if (paramsData.parameter && Array.isArray(paramsData.parameter)) {
					paramsData.parameter.forEach((p: any) => {
						if (p.name && p.value !== undefined) {
							params[p.name] = p.value;
						}
					});
				}

				// Call adhoc-query webhook
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'http://127.0.0.1:5678/webhook/adhoc-query',
					headers: {
						'Content-Type': 'application/json',
					},
					body: {
						query,
						params,
						agent,
					},
					json: true,
				});

				// Extract results from adhoc-query response format
				if (Array.isArray(response) && response[0]) {
					const result = response[0];

					if (result.success && result.results && result.results.data) {
						// Return each row as a separate item
						result.results.data.forEach((row: any) => {
							returnData.push({
								json: row,
								pairedItem: { item: i },
							});
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Query failed: ${result.error || 'Unknown error'}`,
							{ itemIndex: i }
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'Unexpected response format from adhoc-query',
						{ itemIndex: i }
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({
						json: {
							error: errorMessage,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
