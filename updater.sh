while :
do
	git fetch origin
	if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
		git reset FETCH_HEAD --hard

		killall nodejs
		nodejs server.js &> updater.log &
	fi

	sleep 15
done

