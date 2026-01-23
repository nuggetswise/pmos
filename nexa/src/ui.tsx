import React from 'react';
import {Text, Box, Newline} from 'ink';

const Panel = ({title, children}: {title: string, children: React.ReactNode}) => (
	<Box borderStyle="round" flexDirection="column" flexGrow={1}>
		<Text bold>{title}</Text>
		{children}
	</Box>
);

export default function App() {
	return (
		<Box flexDirection="column" width="100%" height="100%">
			<Box>
				<Panel title="Project Dashboard">
					<Text>projects.md content will go here.</Text>
				</Panel>
			</Box>
			<Box>
				<Panel title="Context">
					<Text>Contextual information will be displayed here.</Text>
				</Panel>
				<Panel title="Memory">
					<Text>Memory and learned rules will be displayed here.</Text>
				</Panel>
				<Panel title="Learning">
					<Text>Learning status and history will be displayed here.</Text>
				</Panel>
			</Box>
			<Box>
				<Panel title="Command Output">
					<Text>Output of commands will be streamed here.</Text>
				</Panel>
			</Box>
			<Box borderStyle="single" marginTop={1}>
				<Text>{'> '}</Text>
			</Box>
		</Box>
	);
}