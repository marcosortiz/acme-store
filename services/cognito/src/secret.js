import config from 'config';
import { SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';

const REGION = config.get("aws.region");
const smClient = new SecretsManagerClient({ region: REGION });

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
