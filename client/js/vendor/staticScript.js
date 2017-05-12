tree.push({
	id: "task-id-1",
	name: "Test Task",
	completed: false,
	terminated: false,
	isLeaf: false,
	type: "test",
	date: Date.now,
	parentId: {
		id: -1,
		displayed: false,
		pos: 0
	},
	exceptions: [
		"Test exception"
	],
	displayed: false,
	description: "This is the description",
	artifacts: ["Artifact 1", "Artifact 2"],
	comments: [
		{
			"note": "TEST",
			"datetime": Date.now
		}
	]
});

displayTask(0);