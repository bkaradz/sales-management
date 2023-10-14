<script lang="ts">
	// import type { PageData } from './$types';
	import logo from '$lib/assets/logo.png';
	import { enhance } from '$app/forms';

	// export let data: PageData;

	// export let form;
</script>

<section
	class="gradient-form bg-neutral-200 dark:bg-neutral-700 flex justify-center items-center h-screen"
>
	<div class="container h-full p-10">
		<div
			class="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200"
		>
			<div class="w-full">
				<div class="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
					<div class="g-0 lg:flex lg:flex-wrap">
						<!-- Left column container-->
						<div class="px-4 md:px-0 lg:w-6/12">
							<div class="md:mx-6 md:p-12">
								<!--Logo-->
								<div class="text-center">
									<img class="mx-auto w-48" src={logo} alt="logo" />
									<h4 class="mb-12 mt-1 pb-1 text-xl font-semibold">We are The Lotus Team</h4>
								</div>

								<form method="POST" action="?/login" use:enhance>
									<p class="mb-4">Please login to your account</p>
									<!--Username input-->
									<div class="relative mb-4">
										<input
											type="text"
											name="username"
											class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
											id="username"
											placeholder="Username"
										/>
										<label
											for="username"
											class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
										>
											Username
										</label>
									</div>

									<!--Password input-->
									<div class="relative mb-4">
										<input
											type="password"
											name="password"
											class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
											id="password"
											placeholder="Password"
										/>
										<label
											for="password"
											class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
											>Password
										</label>
									</div>

									<!--Submit button-->
									<div class="mb-12 pb-1 pt-1 text-center">
										<button
											class="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
											type="submit"
											data-te-ripple-init
											data-te-ripple-color="light"
											style="background: linear-gradient(to right, #06b6d4, #3b82f6)"
										>
											Log in
										</button>

										<!--Forgot password link-->
										<a href="#!">Forgot password?</a>
									</div>

									<!--Register button-->
									<div class="flex items-center justify-between pb-6">
										<p class="mb-0 mr-2">Don't have an account?</p>

										<a
											href="/register"
											type="button"
											class="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
											data-te-ripple-init
											data-te-ripple-color="light"
										>
											Register
										</a>
									</div>
								</form>
							</div>
						</div>

						<!-- Right column container with background and description-->
						<div
							class="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
							style="background: linear-gradient(to right, #06b6d4, #3b82f6)"
						>
							<div class="px-4 py-6 text-white md:mx-6 md:p-12">
								<h4 class="mb-6 text-xl font-semibold">We are more than just a company</h4>
								<p class="text-sm">
									Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
									incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
									exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
