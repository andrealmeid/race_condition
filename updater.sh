while :
do
	git fetch origin
	# If current HEAD is different from remote
	if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
		git reset FETCH_HEAD --hard

		killall node
		npm install
		npm start &
	fi

	sleep 15
done &> log.txt

