import { SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';

const smClient = new SecretsManagerClient({ region: process.env.REGION });

export async function getSecretValue(secretName) {
    try {
        const command = new GetSecretValueCommand({
            SecretId: secretName,
        });
        const response = await smClient.send(command);
        return response.SecretString;
    } catch (error) {
        console.log('error getting user password', error);
    }
}